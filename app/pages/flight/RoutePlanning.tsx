import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from "react-redux"
import {Button, CardActions, CardContent, Divider, Slider, Theme, Typography, useTheme} from '@material-ui/core'
import {Feature, FeatureCollection, LineString, Point, Polygon} from "geojson"
import {selectFlightParameters, setFlightParameters} from '@slices/flightParametersSlice'
import {makeStyles} from '@material-ui/core/styles'
import {FlightParameters} from '@interfaces/FlightParameters'
import {removeCompletedPoints, selectCompletedPoints, setCompletedPoints} from '@slices/completedPointsSlice'
import {readFile, writeFile} from 'fs'
import {FlightData} from '@interfaces/FlightData'
import {selectSelectedArea} from '@slices/selectedAreaSlice'
import {selectSelectedPoint} from '@slices/selectedPointSlice'
import * as turf from '@turf/turf'
import {getPointsWithAltitude} from '@/api/api'
import {format} from 'date-fns'

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
        marginLeft: '1rem',
    },
    infoCard: {
        overflow: 'hidden',
    },
    map: {
        border: '1px solid lightgray',
        borderRadius: 8,
        position: 'relative',
        height: '80%',
        marginBottom: '1rem',
    },
})

const RoutePlanning = ({setFeaturesToDraw}: {setFeaturesToDraw: Function}) => {
    const theme: Theme = useTheme()
    const classes = useStyles(theme)
    const dispatch = useDispatch()

    const selectedArea: Feature<Polygon> | undefined = useSelector(selectSelectedArea)
    const selectedPoint: Feature<Point> | undefined = useSelector(selectSelectedPoint)
    const flightParameters: FlightParameters = useSelector(selectFlightParameters)
    const completedPoints: FeatureCollection<Point> = useSelector(selectCompletedPoints)

    const [routeLength, setRouteLength] = useState<number>(0)
    const [missionTime, setMissionTime] = useState<number>(0)

    const [sortedPoints, setSortedPoints] = useState<Feature<Point>[]>([])

    function saveRoute() {
        const {dialog} = require('electron').remote
        dialog.showSaveDialog({title: 'Save Flight Plan', defaultPath: 'route-' + format(new Date(), 'yyyy-MM-dd_HH-mm-ss'), filters: [{name: '', extensions: ['json']}]})
            .then(saveDialogReturnValue => {
                if (!saveDialogReturnValue.canceled && saveDialogReturnValue.filePath) {
                    writeFile(saveDialogReturnValue.filePath, JSON.stringify({
                        flightParameters,
                        completedPoints,
                    }), (err) => {
                        if (err) {
                            alert("An error occurred when creating the file: " + err.message)
                            return
                        }

                        alert("The file has been saved successfully")
                    })
                }
            })

    }

    function loadRoute() {
        const {dialog} = require('electron').remote
        dialog.showOpenDialog({
            title: 'Load Flight Plan',
            buttonLabel: 'Load',
            filters: [{name: '', extensions: ['json']}],
        })
        .then(openDialogReturnValue => {
            const [filePath] = openDialogReturnValue.filePaths
            if (!openDialogReturnValue.canceled && filePath) {
                readFile(filePath, 'utf-8', (err, data) => {
                    if (err) {
                        alert("An error occurred when reading the file: " + err.message)
                        return
                    }

                    try {
                        const flightData = JSON.parse(data) as FlightData
                        setFeaturesToDraw([{
                            type: "Feature",
                            geometry: {
                                type: "LineString",
                                coordinates: flightData.completedPoints.features.map((point) => point.geometry.coordinates)
                            },
                            properties: {}
                        }])

                        dispatch(setFlightParameters(flightData.flightParameters))
                        dispatch(setCompletedPoints(flightData.completedPoints))
                    } catch (_) {
                        alert('Invalid file format')
                    }
                })
            }
        })
    }

    /**
     * Generate waypoint effect
     */
    useEffect(() => {
        if (!selectedArea) {
            setFeaturesToDraw([])
            return
        }

        const featuresToRender: Feature[] = []

        const borderBbox = turf.square(turf.bbox(turf.transformScale(selectedArea, 3, {origin: 'center'}))) // [minX, minY, maxX, maxY]
        const verticalBorderLineString1 = turf.lineString([[borderBbox[0], borderBbox[1]], [borderBbox[0], borderBbox[3]]])
        const verticalBorderLineString2 = turf.lineString([[borderBbox[2], borderBbox[1]], [borderBbox[2], borderBbox[3]]])
        const yLength = turf.length(verticalBorderLineString1, {units: 'meters'})
        const distanceBetweenLines = 2 * (flightParameters.searchRadius ?? 1) - (flightParameters.searchRadiusOverlap ?? 0)
        const lines: Feature<LineString>[] = []

        for (let i = 0; i < yLength / distanceBetweenLines; i++) {
            const point1 = turf.along(verticalBorderLineString1, i * distanceBetweenLines, {units: 'meters'})
            const point2 = turf.along(verticalBorderLineString2, i * distanceBetweenLines, {units: 'meters'})
            if (point1.geometry?.coordinates && point2.geometry?.coordinates) {
                lines.push({
                    type: 'Feature',
                    id: i,
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            point1.geometry.coordinates,
                            point2.geometry.coordinates
                        ]
                    }
                })
            }
        }

        turf.transformRotate({
            type: 'FeatureCollection',
            features: lines
        }, flightParameters.pathRotation ?? 0, {mutate: true})

        const polygonLine = turf.polygonToLine(selectedArea)
        const waypoints: Feature<Point>[] = []

        lines.forEach((line, i) => {
            const intersectingPoints = turf.lineIntersect(line, polygonLine)
            if (intersectingPoints.features.length >= 2) {
                const [startPoint, stopPoint] = intersectingPoints.features as Feature<Point>[]
                if (i % 2 === 0) {
                    waypoints.push(startPoint, stopPoint)
                } else {
                    waypoints.push(stopPoint, startPoint)
                }
            }
        })

        if (selectedPoint) {
            const firstPoint = waypoints[0]
            const lastPoint = waypoints[waypoints.length-1]

            if (firstPoint && lastPoint && turf.distance(firstPoint, selectedPoint, {units: 'meters'}) > turf.distance(lastPoint, selectedPoint, {units: 'meters'})) {
                waypoints.reverse()
            }

            waypoints.unshift(selectedPoint)
            waypoints.push(selectedPoint)
        }

        setSortedPoints(waypoints.map((point, i) => ({...point, id: `${i}`})))

        // featuresToRender.push(polygonLine as Feature<LineString>)
        featuresToRender.push({
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: waypoints.map((point) => point.geometry.coordinates)
            },
            properties: {}
        })

        setRouteLength(0)

        setFeaturesToDraw(featuresToRender)
        dispatch(removeCompletedPoints())
    }, [selectedArea, selectedPoint, flightParameters.searchRadius, flightParameters.searchRadiusOverlap, flightParameters.pathRotation])

    /**
     * Fetch elevation effect
     */
    useEffect(() => {
        if (sortedPoints.length === 0 || !selectedPoint) return;

        getPointsWithAltitude({
            type: "FeatureCollection",
            features: sortedPoints,
        }).then((points: FeatureCollection<Point> | undefined) => {
            dispatch(setCompletedPoints(points ? points : {
                type: "FeatureCollection",
                features: sortedPoints,
            }))
        })
    }, [sortedPoints, selectedPoint])

    /**
     * Calculate mission time effect
     */
    useEffect(() => {
        if (flightParameters.velocity) {
            setMissionTime((routeLength / flightParameters.velocity)/60)
        }
    }, [flightParameters.velocity, routeLength])

    /**
     * Calculate route length effect
     */
    useEffect(() => {
        if (completedPoints.features.length < 2 || completedPoints.features.length !== sortedPoints.length) return

        let calculatedLength = 2 * (flightParameters.elevation ?? 0) // Start ascension and stop descension

        for (let i = 1; i < completedPoints.features.length; i++) {
            const point1 = completedPoints.features[i-1];
            const point2 = completedPoints.features[i];
            const distance = turf.distance(point1.geometry.coordinates, point2.geometry.coordinates, {units: "meters"})
            const heightDifference = Math.abs(Math.max(0, point1?.properties?.altitude ?? 0) - Math.max(0, point2?.properties?.altitude ?? 0))
            calculatedLength += Math.sqrt(distance ** 2 + heightDifference ** 2)
        }

        setRouteLength(calculatedLength)

    }, [completedPoints, sortedPoints, flightParameters])

    return (
        <>
            <CardContent>
                <Typography variant={"h5"} component={"h2"}>Route Planning</Typography>
                <Divider style={{marginBottom: '1rem'}}/>
                <div className={classes.formSection}>
                    <Typography id="search-elevation-slider" gutterBottom>
                        🏔 Drone elevation ({flightParameters.elevation}m)
                    </Typography>
                    <Slider
                        aria-labelledby={'search-elevation-slider'}
                        className={classes.slider}
                        value={flightParameters.elevation}
                        onChange={(_, value) => dispatch(setFlightParameters({elevation: +value}))}
                        step={1}
                        min={5}
                        max={200}
                        marks={[5, 50, 100, 200].map(v => ({value: v, label: v + 'm'}))}
                    />
                </div>
                <div className={classes.formSection}>
                    <Typography id="search-radius-slider" gutterBottom>
                        ⚪️ Search radius ({flightParameters.searchRadius}m)
                    </Typography>
                    <Slider
                        aria-labelledby={'search-radius-slider'}
                        className={classes.slider}
                        value={flightParameters.searchRadius}
                        onChange={(_, value) => dispatch(setFlightParameters({searchRadius: +value}))}
                        step={1}
                        min={Math.max(1, flightParameters.searchRadiusOverlap ?? 1)}
                        max={500}
                        marks={[50, 250, 500].map(v => ({value: v, label: v + 'm'}))}
                    />
                </div>
                <div className={classes.formSection}>
                    <Typography id="search-radius-overlap-slider" gutterBottom>
                        🔲 Search radius overlap ({flightParameters.searchRadiusOverlap}m)
                    </Typography>
                    <Slider
                        aria-labelledby={'search-radius-overlap-slider'}
                        className={classes.slider}
                        value={flightParameters.searchRadiusOverlap}
                        onChange={(_, value) => dispatch(setFlightParameters({searchRadiusOverlap: +value}))}
                        step={1}
                        min={0}
                        max={Math.min(50, flightParameters.searchRadius ?? 50)}
                        marks={[0, 25, 50].map(v => ({value: v, label: v + 'm'}))}
                    />
                </div>
                <div className={classes.formSection}>
                    <Typography id="path-rotation-slider" gutterBottom>
                        🔄 Path rotation ({flightParameters.pathRotation}º)
                    </Typography>
                    <Slider
                        aria-labelledby={'path-rotation-slider'}
                        className={classes.slider}
                        value={flightParameters.pathRotation}
                        onChange={(_, value) => dispatch(setFlightParameters({pathRotation: +value}))}
                        step={15}
                        min={0}
                        max={360}
                        marks={[0, 180, 360].map(v => ({value: v, label: v + 'º'}))}
                    />
                </div>
                <div className={classes.formSection}>
                    <Typography id="acceptance-radius-slider" gutterBottom>
                        🛂 Acceptance radius ({flightParameters.acceptanceRadius}m)
                    </Typography>
                    <Slider
                        aria-labelledby={'acceptance-radius-slider'}
                        className={classes.slider}
                        value={flightParameters.acceptanceRadius}
                        onChange={(_, value) => dispatch(setFlightParameters({acceptanceRadius: +value}))}
                        step={1}
                        min={1}
                        max={20}
                        marks={[1, 10, 20].map(v => ({value: v, label: v + 'm'}))}
                    />
                </div>
                <div className={classes.formSection}>
                    <Typography id="drone-velocity-slider" gutterBottom>
                        🏎 Drone velocity ({flightParameters.velocity}m/s)
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
                    <Typography gutterBottom>Route length: {(routeLength / 1000)?.toFixed(1)} km</Typography>
                    <Typography gutterBottom>Mission time: {missionTime?.toFixed(0)} minutes</Typography>
                </div>
            </CardContent>
            <CardActions>
                <Button size="small" onClick={saveRoute} disabled={completedPoints.features.length === 0}>Save route</Button>
                <Button size="small" onClick={loadRoute}>Load route</Button>
            </CardActions>
        </>

    )
}

export default RoutePlanning
