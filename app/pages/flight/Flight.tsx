import React, {useEffect, useState} from 'react';
import Map from "./Map";
import {useDispatch, useSelector} from "react-redux";
import {selectSelectedArea} from "@slices/selectedAreaSlice";
import {Button, Card, CardActions, CardContent, Divider, Slider, Theme, Typography, useTheme} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import * as turf from "@turf/turf";
import {AllGeoJSON} from "@turf/turf";
import {Feature, FeatureCollection, LineString, Point, Polygon} from "geojson";
import {selectSelectedPoint} from "@slices/selectedPointSlice";
import {selectCompletedPoints, setCompletedPoints, removeCompletedPoints} from '@slices/completedPointsSlice'
import {getTerrainData} from "@/api/api";
import {FlightParameters} from "@interfaces/FlightParameters";
import {selectFlightParameters, setFlightParameters} from "@slices/flightParametersSlice"
import mav from '@/api/mav-connection'
import {DroneStatus} from "@interfaces/DroneStatus";
import {selectDroneStatus} from "@slices/droneStatusSlice";
import {TerrainData} from "@interfaces/TerrainData";

const useStyles = makeStyles({
    root: {
        display: 'flex',
        height: '100%',
    },
    sidebar: {
        minWidth: '20rem',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        padding: '2rem',
        overflow: 'auto',
    },
    formSection: {
        marginBottom: '1rem',
    },
    slider: {
        width: '14rem',
        marginLeft: '1rem'
    },
    infoCard: {
        overflow: 'hidden',
    },
    map: {
        border: '1px solid lightgray',
        borderRadius: 8,
        position: 'relative',
        height: '100%',
    }
})

export default function Flight() {
    const theme: Theme = useTheme()
    const classes = useStyles(theme)
    const dispatch = useDispatch()

    const selectedArea: Feature<Polygon> | undefined = useSelector(selectSelectedArea)
    const selectedPoint: Feature<Point> | undefined = useSelector(selectSelectedPoint)
    const completedPoints: FeatureCollection<Point> = useSelector(selectCompletedPoints)
    const flightParameters: FlightParameters = useSelector(selectFlightParameters)
    const droneStatus: DroneStatus = useSelector(selectDroneStatus)

    const [searchRadius, setSearchRadius] = useState<number>(150)
    const [searchRadiusOverlap, setSearchRadiusOverlap] = useState<number>(0)


    const [searchWidth, setSearchWidth] = useState<number>(0)
    const [searchHeight, setSearchHeight] = useState<number>(0)
    const [routeLength, setRouteLength] = useState<number>(0)
    const [missionTime, setMissionTime] = useState<number>(0)

    const [features, setFeatures] = useState<Feature[]>([])
    const [sortedPoints, setSortedPoints] = useState<Feature<Point>[]>([])

    useEffect(() => {
        if (!selectedArea) {
            setFeatures([])
            return
        }

        const featuresToRender: Feature[] = []

        const data: AllGeoJSON = selectedArea as AllGeoJSON
        const bbox = turf.bbox(data) // [minX, minY, maxX, maxY]

        const bboxPolygon: Feature<Polygon> = turf.bboxPolygon(bbox) as Feature<Polygon>;
        featuresToRender.push(bboxPolygon)

        const xLength = turf.distance(turf.point(bboxPolygon.geometry.coordinates[0][0]), turf.point(bboxPolygon.geometry.coordinates[0][1]), {units: 'meters'})
        const yLength = turf.distance(turf.point(bboxPolygon.geometry.coordinates[0][1]), turf.point(bboxPolygon.geometry.coordinates[0][2]), {units: 'meters'})
        setSearchWidth(xLength)
        setSearchHeight(yLength)

        const grid = turf.pointGrid(bbox, (searchRadius * 2) - searchRadiusOverlap, {units: "meters"}).features as Feature<Point>[]

        const pointRadiusPolygons: Feature<Polygon>[] = grid.map(point => turf.circle(point, searchRadius, {units: "meters"}) as Feature<Polygon>)
        featuresToRender.push(...pointRadiusPolygons)

        const sortedGrid: Feature<Point>[] = []
        const colCount = Math.ceil(yLength/((searchRadius*2) - searchRadiusOverlap))
        let buffer: Feature<Point>[] = []
        let flip = false
        let i = 0
        while (sortedGrid.length < grid.length) {
            if (flip) {
                buffer.unshift(grid[i])
            } else {
                buffer.push(grid[i])
            }

            if (buffer.length >= colCount) {
                sortedGrid.push(...buffer)
                buffer = []
            }

            if (++i % colCount === 0) {
                flip = !flip
            }
        }

        if (selectedPoint) {
            sortedGrid.unshift(selectedPoint)
            sortedGrid.push(selectedPoint)
            featuresToRender.push(turf.circle(selectedPoint, 10, {units: "meters"}) as Feature<Polygon>)

            // console.log(generatePermutations(grid.map(point => point.geometry.coordinates)));

            // console.log(generateCityRoutes([0,1,2,3]));
        }

        setSortedPoints(sortedGrid.map((point, i) => ({...point, id: `${i}`})))

        const line: Feature<LineString> = ({
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: sortedGrid.map((point) => point.geometry.coordinates)
            },
            properties: {}
        })
        featuresToRender.push(line)

        setRouteLength(0)

        setFeatures(featuresToRender)
        dispatch(removeCompletedPoints())
    }, [selectedArea, selectedPoint, searchRadius, searchRadiusOverlap])

    useEffect(() => {
        if (sortedPoints.length === 0 || completedPoints.features.length >= sortedPoints.length) return

        const completedPointIds: string[] = completedPoints.features.map(feature => `${feature.id}`)
        const incompletePoints = sortedPoints.filter(point => !completedPointIds.includes(`${point.id}`))

        const results: TerrainData[] = []
        const fetches: Promise<void>[] = []
        incompletePoints.forEach((point: Feature<Point>) => {
            fetches.push(
                getTerrainData(point.geometry.coordinates[1], point.geometry.coordinates[0])
                    .then((terrainData: TerrainData) => {
                        terrainData.pointId = `${point.id}`
                        results.push(terrainData)
                    })
                    .catch(console.error)
            )
        })
        Promise.all(fetches)
            .then(() => {
                const newCompletedPoints = results.map((terrainData: TerrainData) => {
                    const associatedPoint: Feature<Point> | undefined = incompletePoints.find(point => `${point.id}` === terrainData.pointId)
                    if (!associatedPoint) {
                        return undefined
                    }

                    return {
                        ...associatedPoint,
                        properties: {
                            ...associatedPoint.properties,
                            ...terrainData,
                        }
                    }
                })

                dispatch(setCompletedPoints({
                    type: "FeatureCollection",
                    features: [...completedPoints.features, ...newCompletedPoints].sort((a: any, b: any) => +a?.id - +b?.id) as Feature<Point>[]
                }))
            })
    }, [completedPoints, sortedPoints])


    useEffect(() => {
        if (flightParameters.velocity) {
            setMissionTime((routeLength / flightParameters.velocity)/60)
        }
    }, [flightParameters, routeLength])

    useEffect(() => {
        if (completedPoints.features.length < 2 || completedPoints.features.length !== sortedPoints.length) return

        let calculatedLength = 2 * (flightParameters.elevation ?? 0) // Start ascension and stop descension

        for (let i = 1; i < completedPoints.features.length; i++) {
            const point1 = completedPoints.features[i-1];
            const point2 = completedPoints.features[i];
            const distance = turf.distance(point1.geometry.coordinates, point2.geometry.coordinates, {units: "meters"})
            const heightDifference = Math.abs(Math.max(point1?.properties?.elevation || 0, 0) - Math.max(point2?.properties?.elevation || 0, 0))
            calculatedLength += Math.sqrt(distance ** 2 + heightDifference ** 2)
        }

        setRouteLength(calculatedLength)

    }, [completedPoints, sortedPoints, flightParameters])

    return (
        <div className={classes.root}>
            <aside className={classes.sidebar}>
                <Card variant={"outlined"}>
                    <CardContent>
                        <Typography variant={"h5"} component={"h2"}>Route planning</Typography>
                        <Divider style={{marginBottom: '1rem'}}/>
                        <div className={classes.formSection}>
                            <Typography id="search-elevation-slider" gutterBottom>
                                Drone elevation ({flightParameters.elevation}m)
                            </Typography>
                            <Slider
                                aria-labelledby={'search-elevation-slider'}
                                className={classes.slider}
                                value={flightParameters.elevation}
                                onChange={(_, value) => dispatch(setFlightParameters({elevation: +value}))}
                                step={10}
                                min={10}
                                max={500}
                                marks={[10, 250, 500].map(v => ({value: v, label: v + 'm'}))}
                            />
                        </div>
                        <div className={classes.formSection}>
                            <Typography id="search-radius-slider" gutterBottom>
                                Search radius ({searchRadius}m)
                            </Typography>
                            <Slider
                                aria-labelledby={'search-radius-slider'}
                                className={classes.slider}
                                value={searchRadius}
                                onChange={(_, value) => setSearchRadius(+value)}
                                step={10}
                                min={10}
                                max={500}
                                marks={[50, 250, 500].map(v => ({value: v, label: v + 'm'}))}
                            />
                        </div>
                        <div className={classes.formSection}>
                            <Typography id="search-radius-overlap-slider" gutterBottom>
                                Search radius overlap ({searchRadiusOverlap}m)
                            </Typography>
                            <Slider
                                aria-labelledby={'search-radius-overlap-slider'}
                                className={classes.slider}
                                value={searchRadiusOverlap}
                                onChange={(_, value) => setSearchRadiusOverlap(+value)}
                                step={1}
                                min={0}
                                max={50}
                                marks={[0, 25, 50].map(v => ({value: v, label: v + 'm'}))}
                            />
                        </div>
                        <div className={classes.formSection}>
                            <Typography id="drone-velocity-slider" gutterBottom>
                                Drone velocity ({flightParameters.velocity}m/s)
                            </Typography>
                            <Slider
                                aria-labelledby={'drone-velocity-slider'}
                                className={classes.slider}
                                value={flightParameters.velocity}
                                onChange={(_, value) => dispatch(setFlightParameters({velocity: +value}))}
                                step={1}
                                min={1}
                                max={20}
                                marks={[1, 10, 20].map(v => ({value: v, label: v + 'm/s'}))}
                            />
                        </div>
                        <Divider style={{marginBottom: '1rem'}}/>
                        <div className={classes.formSection}>
                            <Typography gutterBottom>Search area: {selectedArea ? '✅' : '❌'}</Typography>
                            <Typography gutterBottom>Start/end point: {selectedPoint ? '✅' : '❌'}</Typography>
                            <Typography gutterBottom>Area: {(searchWidth * searchHeight / 1000000).toFixed(0)} km²</Typography>
                            <Typography gutterBottom>Route length: {(routeLength / 1000)?.toFixed(1)} km</Typography>
                            <Typography gutterBottom>Mission time: {missionTime?.toFixed(0)} minutes</Typography>
                        </div>
                        <Divider style={{marginBottom: '1rem'}}/>
                        <div className={classes.formSection}>
                            <Typography gutterBottom>Drone connected: {droneStatus.connected ? '✅' : '❌'}</Typography>
                            <Typography gutterBottom>Drone armed: {droneStatus.armed ? '✅' : '❌'}</Typography>
                            <Typography gutterBottom>Drone velocity: {droneStatus.targetVelocity === flightParameters.velocity ? '✅' : '❌'}</Typography>
                            <Button size="small" onClick={() => flightParameters.velocity && mav.setDroneVelocity(flightParameters.velocity)} disabled={!droneStatus.connected || droneStatus.targetVelocity === flightParameters.velocity}>Sync velocity</Button>
                        </div>
                    </CardContent>
                    <CardActions>
                        <Button size="small" onClick={() => {}}>Save route</Button>
                    </CardActions>
                </Card>
            </aside>
            <main className={classes.content}>
                <div className={classes.map}>
                    <Map features={features} />
                </div>
            </main>
        </div>
    )
}
