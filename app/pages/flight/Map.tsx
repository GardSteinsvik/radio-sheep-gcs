import React, {useEffect, useRef, useState} from 'react'
import mapboxgl, {LngLatLike} from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import {Feature, FeatureCollection, Point, Polygon} from 'geojson'
import {useDispatch, useSelector} from "react-redux"
import {removeSelectedArea, setSelectedArea} from '@slices/selectedAreaSlice'
import {removeSelectedPoint, setSelectedPoint} from '@slices/selectedPointSlice'
import {selectCompletedPoints} from "@slices/completedPointsSlice"
import {selectDroneStatus} from "@slices/droneStatusSlice"
import {DroneStatus} from "@interfaces/DroneStatus"
import {selectElevationProfile} from "@slices/elevationProfileSlice"
import {ElevationProfile} from "@interfaces/ElevationProfile"
import {MapParameters} from "@interfaces/MapParameters"
import {selectMapParameters} from "@slices/mapParametersSlice"
import {FlightParameters} from "@interfaces/FlightParameters"
import {selectFlightParameters} from "@slices/flightParametersSlice"
import * as turf from "@turf/turf"
import {selectSheepRttPoints} from "@slices/sheepRttPointsSlice"
import {DroneStatusControl} from "@/components/DroneStatusControl/DroneStatusControl"
import {selectSelectedSheepRttPoint} from "@slices/selectedSheepRttPointSlice"
import {topo4, topo4graatone} from "@/pages/flight/mapStyles"
import {selectEstimatedSheepPoints} from "@slices/estimatedSheepPointsSlice"
import {selectActualSheepPoints} from "@slices/actualSheepPointsSlice"

const SOURCES = {
    WAYPOINTS: 'waypoints',
    DRONE: 'drone',
    ELEVATION_PROFILE: 'elevation-profile',
    SHEEP_RTT_POINTS: 'sheep-rtt-points',
    ESTIMATED_SHEEP_POINTS: 'estimated-sheep-points',
    ACTUAL_SHEEP_POINTS: 'actual-sheep-points',
}

const LAYERS = ({
    SEARCH_AREA: 'search_area',
    POINT: 'point',
    LINE: 'line',
    DRONE: 'drone',
    ACCEPTANCE_RADIUS: 'acceptance-radius',
    SEARCH_RADIUS: 'search-radius',
    COMPLETED_POINTS: 'completed-points',
    SHEEP_RTT_POINTS: 'sheep-rtt-points',
    ESTIMATED_SHEEP_POINTS: 'estimated-sheep-points',
    ACTUAL_SHEEP_POINTS: 'actual-sheep-points',
})

interface Props {
    features?: Feature[]
}

export default function Map({features = []}: Props) {

    const dispatch = useDispatch()
    const mapContainerRef = useRef(null);

    const completedPoints = useSelector(selectCompletedPoints)
    const droneStatus: DroneStatus = useSelector(selectDroneStatus)
    const flightParameters: FlightParameters = useSelector(selectFlightParameters)
    const elevationProfile: ElevationProfile | undefined = useSelector(selectElevationProfile)
    const sheepRttPoints: FeatureCollection<Point> = useSelector(selectSheepRttPoints)
    const selectedSheepRttPoint: number = useSelector(selectSelectedSheepRttPoint)
    const estimatedSheepPoints: FeatureCollection<Point> = useSelector(selectEstimatedSheepPoints)
    const actualSheepPoints: FeatureCollection<Point> = useSelector(selectActualSheepPoints)

    const mapParameters: MapParameters = useSelector(selectMapParameters)

    const [map, setMap] = useState<mapboxgl.Map>()
    const element = document.createElement('div')
    element.className = "drone" // CSS located in app.global.css
    const [droneMarker] = useState<mapboxgl.Marker>(new mapboxgl.Marker(element))

    const [droneStatusControl, setDroneStatusControl] = useState<DroneStatusControl>()

    let DrawControl: MapboxDraw

    function drawFeatures(features: Feature[]) {
        [LAYERS.LINE, LAYERS.POINT].forEach(layerId => {
            if (map?.getLayer(layerId)) {
                map?.removeLayer(layerId)
            }
        })

        if (map?.getSource('generated-data')) {
            map?.removeSource('generated-data')
        }

        map?.addSource('generated-data', {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: features,
            }
        })

        map?.addLayer({
            'id': LAYERS.LINE,
            'type': 'line',
            'source': 'generated-data',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#004970',
                'line-width': 2
            },
            'filter': ['==', '$type', 'LineString']
        });

        map?.addLayer({
            'id': LAYERS.POINT,
            'type': 'circle',
            'source': 'generated-data',
            'paint': {
                'circle-radius': 3,
                'circle-color': '#00cfff',
            },
            'filter': ['==', '$type', 'Point']
        });
    }

    function setArea(featureCollection: FeatureCollection) {
        featureCollection.type = "FeatureCollection"
        const feature: Feature = featureCollection.features[0];

        switch (feature.geometry.type) {
            case "Polygon":
                dispatch(setSelectedArea(feature as Feature<Polygon>))
                break
            case "Point":
                dispatch(setSelectedPoint(feature as Feature<Point>))
                break
        }
    }

    function deleteArea(featureCollection: FeatureCollection) {
        featureCollection.type = "FeatureCollection"
        const feature: Feature = featureCollection.features[0]

        switch (feature.geometry.type) {
            case "Polygon":
                dispatch(removeSelectedArea())
                break
            case "Point":
                dispatch(removeSelectedPoint())
                break
        }
    }

    useEffect(() => {
        // mapboxgl.accessToken = process.env.MAPBOX_API_KEY || '';

        const initializeMap = (setMap: Function, mapContainer: any) => {
            const map = new mapboxgl.Map({
                container: mapContainer.current,
                // style: 'mapbox://styles/mapbox/outdoors-v11', // Requires API key
                style: topo4,
                center: [10.3951, 63.4305],
                zoom: 12.5,
            })

            droneMarker.setRotationAlignment('map').setPitchAlignment('map')

            DrawControl = new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    polygon: true,
                    point: true,
                    trash: true
                },
            })

            map.addControl(DrawControl);

            setDroneStatusControl(new DroneStatusControl())

            map.addControl(new mapboxgl.FullscreenControl(), 'top-left')
            map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
            map.addControl(new mapboxgl.AttributionControl({customAttribution: ['©Kartverket (CC BY 4.0)']}), 'bottom-left')
            map.addControl(new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true
            }), 'bottom-right');

            map.on('error', () => {}) // Shhhh

            map.on('draw.create', setArea)
            map.on('draw.update', setArea)
            map.on('draw.delete', deleteArea)

            map.on("load", () => {
                setMap(map);
                map.resize();
                // const minZoomThreshold = 13;


                // dispatch(setSheepRttPoints({
                //     'type': "FeatureCollection",
                //     features: (sample1 as FeatureCollection<Point>).features
                // }))

            });

            // Create a popup, but don't add it to the map yet.
            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            map.on('mouseenter', LAYERS.COMPLETED_POINTS, function (e) {
                // Change the cursor style as a UI indicator.
                map.getCanvas().style.cursor = 'pointer';

                const point = e?.features?.[0] as Feature<Point> | undefined
                if (!point) return

                const coordinates = point.geometry.coordinates.slice();
                const description = `
                    <strong>Point #${point.id}</strong>
                    <p>Altitude: ${point.properties?.altitude}m</p>
                    <p>Terrain: ${point.properties?.terreng}</p>
                `

                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                // Populate the popup and set its coordinates
                // based on the feature found.
                popup.setLngLat(coordinates as LngLatLike).setHTML(description).addTo(map);
            });

            map.on('mouseleave', LAYERS.COMPLETED_POINTS, function () {
                map.getCanvas().style.cursor = '';
                popup.remove();
            });
        }

        if (!map) {
            initializeMap(setMap, mapContainerRef)
        }
    }, [map]);

    useEffect(() => {
        map?.setPaintProperty(SOURCES.ELEVATION_PROFILE, 'raster-opacity', mapParameters.elevationProfileVisibility/100)
    }, [mapParameters.elevationProfileVisibility])

    useEffect(() => {
        map?.setStyle(mapParameters.grayTone ? topo4graatone : topo4)
    }, [mapParameters.grayTone])

    useEffect(() => {
        drawFeatures(features)
    }, [features])

    useEffect(() => {
        if (droneStatusControl && droneStatusControl.shouldUpdate()) {
            map?.removeControl(droneStatusControl)
            droneStatusControl.update(droneStatus)
            map?.addControl(droneStatusControl, 'bottom-left')
        }
    }, [droneStatusControl, droneStatus])

    useEffect(() => {
        if (map?.getLayer(LAYERS.COMPLETED_POINTS)) map?.removeLayer(LAYERS.COMPLETED_POINTS)
        if (map?.getLayer(LAYERS.ACCEPTANCE_RADIUS)) map?.removeLayer(LAYERS.ACCEPTANCE_RADIUS)
        if (map?.getLayer(LAYERS.SEARCH_RADIUS)) map?.removeLayer(LAYERS.SEARCH_RADIUS)

        if (map?.getSource(SOURCES.WAYPOINTS)) map?.removeSource(SOURCES.WAYPOINTS)

        const searchRadiusPolygons = completedPoints.features.slice(1, -1).map(point => turf.circle(point, flightParameters.searchRadius ?? 0, {units: "meters"}) as Feature<Polygon>)
        const acceptanceRadiusPolygons = completedPoints.features.map(point => turf.circle(point, flightParameters.acceptanceRadius ?? 0, {units: "meters"}) as Feature<Polygon>)

        searchRadiusPolygons.forEach(polygon => polygon.properties = {...polygon.properties, type: LAYERS.SEARCH_RADIUS})
        acceptanceRadiusPolygons.forEach(polygon => polygon.properties = {...polygon.properties, type: LAYERS.ACCEPTANCE_RADIUS})

        map?.addSource(SOURCES.WAYPOINTS, {
            type: "geojson",
            data: {
                type: 'FeatureCollection',
                features: [
                    ...completedPoints.features,
                    ...searchRadiusPolygons,
                    ...acceptanceRadiusPolygons,
                ]
            },
        })

        map?.addLayer({
            'id': LAYERS.COMPLETED_POINTS,
            'type': 'circle',
            'source': SOURCES.WAYPOINTS,
            'paint': {
                'circle-radius': 4,
                'circle-color': '#00cfff'
            },
            'filter': ['==', '$type', 'Point']
        })

        map?.addLayer({
            'id': LAYERS.ACCEPTANCE_RADIUS,
            'source': SOURCES.WAYPOINTS,
            'type': 'fill',
            'paint': {
                'fill-opacity': 0.3,
                'fill-color': '#00cfff'
            },
            'filter': ['==', ['get', 'type'], LAYERS.ACCEPTANCE_RADIUS]
        })

        map?.addLayer({
            'id': LAYERS.SEARCH_RADIUS,
            'source': SOURCES.WAYPOINTS,
            'type': 'line',
            'paint': {
                'line-color': '#2a2a2a',
                'line-width': 2,
                'line-dasharray': [1, 2],
            },
            'filter': ['==', ['get', 'type'], LAYERS.SEARCH_RADIUS]
        })
    }, [completedPoints, flightParameters.acceptanceRadius, flightParameters.searchRadius])

    useEffect(() => {
        if (droneStatus.latitude !== undefined && droneStatus.longitude !== undefined) {
            if (droneStatus.connected) {
                const droneAbsoluteVelocity = Math.sqrt((droneStatus.vx ?? 0)**2 + (droneStatus.vy ?? 0)**2 + (droneStatus.vz ?? 0)**2)
                if (droneAbsoluteVelocity >= 1) {
                    droneMarker.getElement().className = 'drone droneMoving'
                } else {
                    droneMarker.getElement().className = 'drone droneConnected'
                }
            } else {
                droneMarker.getElement().className = 'drone'
            }

            if (map) {
                // @ts-ignore
                droneMarker.setLngLat([droneStatus.longitude, droneStatus.latitude])?.setRotation(droneStatus.yaw ?? 0).addTo(map)
            }
        }
    }, [droneStatus])

    useEffect(() => {
        if (map?.getLayer(SOURCES.ELEVATION_PROFILE)) {
            map?.removeLayer(SOURCES.ELEVATION_PROFILE)
        }

        if (map?.getSource(SOURCES.ELEVATION_PROFILE)) {
            map?.removeSource(SOURCES.ELEVATION_PROFILE)
        }

        if (elevationProfile) {
            const {bbox, height, width} = elevationProfile

            map?.addSource(SOURCES.ELEVATION_PROFILE, {
                'type': 'image',
                    'url': `https://wms.geonorge.no/skwms1/wms.hoyde-dom_somlos_prosjekter?REQUEST=GetMap&crs=EPSG:4326&bbox=${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]}&width=${width}&height=${height}&format=image/jpeg&layers=las_dom_somlos`,
                    'coordinates': [
                        [bbox[0], bbox[3]],
                        [bbox[2], bbox[3]],
                        [bbox[2], bbox[1]],
                        [bbox[0], bbox[1]]
                    ]
            })

            map?.addLayer({
                'id': SOURCES.ELEVATION_PROFILE,
                'source': SOURCES.ELEVATION_PROFILE,
                'type': 'raster',
                'paint': { 'raster-opacity': mapParameters.elevationProfileVisibility/100 }
            })
        }
    }, [elevationProfile])

    useEffect(() => {
        if (map?.getLayer(SOURCES.SHEEP_RTT_POINTS)) {
            map?.removeLayer(SOURCES.SHEEP_RTT_POINTS)
        }

        if (map?.getSource(SOURCES.SHEEP_RTT_POINTS)) {
            map?.removeSource(SOURCES.SHEEP_RTT_POINTS)
        }

        const sheepRttPolygons = sheepRttPoints.features.map(point => turf.circle(point, point.properties?.dis || .1, {units: "meters"}) as Feature<Polygon>)

        map?.addSource(SOURCES.SHEEP_RTT_POINTS, {
            type: 'geojson',
            data: {
                type: "FeatureCollection",
                features: sheepRttPolygons,
            },
        })

        map?.addLayer({
            'id': LAYERS.SHEEP_RTT_POINTS,
            'type': 'line',
            'source': SOURCES.SHEEP_RTT_POINTS,
            'paint': {
                'line-color': [
                    'case',
                    ['boolean', ['==', ['get', 'tid'], selectedSheepRttPoint], false],
                    'rgba(255,0,0,0.4)',
                    'rgba(33,93,99,0.2)'
                ],
                'line-width': 1,
            },
        })
    }, [sheepRttPoints, selectedSheepRttPoint])

    useEffect(() => {
        if (map?.getLayer(SOURCES.ESTIMATED_SHEEP_POINTS)) map?.removeLayer(SOURCES.ESTIMATED_SHEEP_POINTS)

        if (map?.getSource(SOURCES.ESTIMATED_SHEEP_POINTS)) map?.removeSource(SOURCES.ESTIMATED_SHEEP_POINTS)

        map?.addSource(SOURCES.ESTIMATED_SHEEP_POINTS, {
            type: 'geojson',
            data: estimatedSheepPoints,
        })

        map?.addLayer({
            'id': LAYERS.ESTIMATED_SHEEP_POINTS,
            'type': 'circle',
            'source': SOURCES.ESTIMATED_SHEEP_POINTS,
            'paint': {
                'circle-radius': 4,
                'circle-color': [
                    'case',
                    ['boolean', ['==', ['id'], selectedSheepRttPoint], false],
                    '#ac0000',
                    '#0fac00',
                ],
                'circle-stroke-width': 2,
                'circle-stroke-color': '#333',
            },
        })
    }, [estimatedSheepPoints, selectedSheepRttPoint])

    useEffect(() => {
        if (map?.getLayer(SOURCES.ACTUAL_SHEEP_POINTS)) map?.removeLayer(SOURCES.ACTUAL_SHEEP_POINTS)

        if (map?.getSource(SOURCES.ACTUAL_SHEEP_POINTS)) map?.removeSource(SOURCES.ACTUAL_SHEEP_POINTS)

        map?.addSource(SOURCES.ACTUAL_SHEEP_POINTS, {
            type: 'geojson',
            data: actualSheepPoints,
        })

        map?.addLayer({
            'id': LAYERS.ACTUAL_SHEEP_POINTS,
            'type': 'circle',
            'source': SOURCES.ACTUAL_SHEEP_POINTS,
            'paint': {
                'circle-radius': 4,
                'circle-color': [
                    'case',
                    ['boolean', ['==', ['id'], selectedSheepRttPoint], false],
                    '#a55c62',
                    '#92a987',
                ],
                'circle-stroke-width': 2,
                'circle-stroke-color': '#555',
            },
        })
    }, [actualSheepPoints, selectedSheepRttPoint])

    useEffect(() => {
        if (estimatedSheepPoints.features.length === 0 || actualSheepPoints.features.length === 0) return

        const totalErrorLength = estimatedSheepPoints.features.reduce((acc, curr) => {
            const point2 = actualSheepPoints.features.find(p => `${p.id}` === `${curr.id}`)
            if (!point2) throw new Error()
            const distance = turf.distance(curr.geometry.coordinates, point2.geometry.coordinates, {units: "meters"})
            return acc + distance
        }, 0)

        console.log('Total error length', totalErrorLength)

    }, [estimatedSheepPoints, actualSheepPoints])

    return <div style={{position: 'absolute', top: 0, bottom: 0, width: '100%', borderRadius: 8}} ref={mapContainerRef} />
}
