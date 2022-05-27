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
import {MapParameters} from "@interfaces/MapParameters"
import {selectMapParameters} from "@slices/mapParametersSlice"
import {FlightParameters} from "@interfaces/FlightParameters"
import {selectFlightParameters} from "@slices/flightParametersSlice"
import * as turf from "@turf/turf"
import {selectSheepRttPoints} from "@slices/sheepRttPointsSlice"
import {DroneStatusControl} from "@/components/CustomControls/DroneStatusControl"
import {selectSelectedSheepRttPoint} from "@slices/selectedSheepRttPointSlice"
import {topo4, topo4graatone} from "@/pages/flight/mapStyles"
import {selectEstimatedSheepPoints} from "@slices/estimatedSheepPointsSlice"
import {selectActualSheepPoints} from "@slices/actualSheepPointsSlice"
import MapboxGLButtonControl from '@/components/CustomControls/MapboxGLButtonControl'

const SOURCES = {
    WAYPOINTS: 'waypoints',
    DRONE: 'drone',
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
    ESTIMATED_SHEEP_POINTS_UNCERTAINTY: 'estimated-sheep-points-uncertainty',
    ACTUAL_SHEEP_POINTS: 'actual-sheep-points',
})

interface Props {
    features?: Feature[]
}

export default function Map({features = []}: Props) {

    const dispatch = useDispatch()
    const mapContainerRef = useRef(null);

    const [sheepRTTCounter, setSheepRTTCounter] = useState(0);

    const completedPoints = useSelector(selectCompletedPoints)
    const droneStatus: DroneStatus = useSelector(selectDroneStatus)
    const flightParameters: FlightParameters = useSelector(selectFlightParameters)
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
    const [moveToDroneControl, setMoveToDroneControl] = useState<MapboxGLButtonControl>()

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
                center: [9.095142, 62.692966],
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
            setMoveToDroneControl(new MapboxGLButtonControl({
                className: 'mapbox-gl-goto-drone',
                title: 'Move to drone',
            }))

            map.addControl(new mapboxgl.FullscreenControl(), 'top-left')
            map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
            map.addControl(new mapboxgl.AttributionControl({customAttribution: ['©Kartverket (CC BY 4.0)']}), 'bottom-left')

            map.on('error', () => {}) // Shhhh

            map.on('draw.create', setArea)
            map.on('draw.update', setArea)
            map.on('draw.delete', deleteArea)

            map.on("load", () => {
                setMap(map)
                map.resize()
            })

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
        map?.setStyle(mapParameters.grayTone ? topo4graatone : topo4)
    }, [mapParameters.grayTone])

    useEffect(() => {
        if (sheepRTTCounter >= 5 || sheepRTTCounter == 0) {
            drawFeatures(features);
            setSheepRTTCounter(1);
        }   
        else {
            setSheepRTTCounter(sheepRTTCounter + 1);
        }
    }, [features])

    useEffect(() => {
        if (droneStatusControl && droneStatusControl.shouldUpdate()) {
            map?.removeControl(droneStatusControl)
            droneStatusControl.update(droneStatus)
            map?.addControl(droneStatusControl, 'bottom-left')
        }
    }, [droneStatusControl, droneStatus])

    useEffect(() => {
        if (moveToDroneControl && moveToDroneControl.shouldUpdate()) {
            map?.removeControl(moveToDroneControl)
            moveToDroneControl.updateEventHandler(() => {
                droneStatus.longitude && droneStatus.latitude && map?.flyTo({
                    center: [
                        droneStatus.longitude,
                        droneStatus.latitude,
                    ],
                    essential: true
                })
            })
            map?.addControl(moveToDroneControl, 'bottom-right')
        }
    }, [moveToDroneControl, droneStatus])

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
                'fill-opacity': 0.1,
                'fill-color': '#00cfff'
            },
            'filter': ['==', ['get', 'type'], LAYERS.ACCEPTANCE_RADIUS]
        })

        map?.addLayer({
            'id': LAYERS.SEARCH_RADIUS,
            'source': SOURCES.WAYPOINTS,
            'type': 'line',
            'paint': {
                'line-color': 'rgba(42,42,42,0.4)',
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
                // @ts-ignore :: Type library doesnt contain .setRotation()
                droneMarker.setLngLat([droneStatus.longitude, droneStatus.latitude])?.setRotation(droneStatus.yaw ?? 0).addTo(map)
            }
        }
    }, [droneStatus])

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
        if (map?.getLayer(LAYERS.ESTIMATED_SHEEP_POINTS)) map?.removeLayer(LAYERS.ESTIMATED_SHEEP_POINTS)
        if (map?.getLayer(LAYERS.ESTIMATED_SHEEP_POINTS_UNCERTAINTY)) map?.removeLayer(LAYERS.ESTIMATED_SHEEP_POINTS_UNCERTAINTY)

        if (map?.getSource(SOURCES.ESTIMATED_SHEEP_POINTS)) map?.removeSource(SOURCES.ESTIMATED_SHEEP_POINTS)

        const uncertaintyCircles = estimatedSheepPoints.features.map(point => turf.circle(point, point.properties?.uncertainty || 0.1, {units: 'meters'}) as Feature<Polygon>)

        map?.addSource(SOURCES.ESTIMATED_SHEEP_POINTS, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [
                    ...estimatedSheepPoints.features,
                    ...uncertaintyCircles,
                ],
            },
        })

        map?.addLayer({
            'id': LAYERS.ESTIMATED_SHEEP_POINTS,
            'source': SOURCES.ESTIMATED_SHEEP_POINTS,
            'type': 'circle',
            'paint': {
                'circle-radius': 3,
                'circle-color': 'rgba(0,0,0,0)',
                'circle-stroke-color': [
                    'case',
                    ['boolean', ['==', ['id'], selectedSheepRttPoint], false],
                    'rgba(172,0,0,0.5)',
                    'rgba(15,172,0,0.5)',
                ],
                'circle-stroke-width': 4,
            },
            'filter': ['==', '$type', 'Point']
        })
        map?.addLayer({
            'id': LAYERS.ESTIMATED_SHEEP_POINTS_UNCERTAINTY,
            'source': SOURCES.ESTIMATED_SHEEP_POINTS,
            'type': 'fill',
            'paint': {
                'fill-opacity': 0.1,
                'fill-color': '#339966'
            },
            'filter': ['==', '$type', 'Polygon']
        })
    }, [estimatedSheepPoints, selectedSheepRttPoint])

    useEffect(() => {
        if (map?.getLayer(LAYERS.ACTUAL_SHEEP_POINTS)) map?.removeLayer(LAYERS.ACTUAL_SHEEP_POINTS)

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
                    '#ac0000',
                    '#0fac00',
                ],
                'circle-stroke-width': 2,
                'circle-stroke-color': '#333',
            },
        })
    }, [actualSheepPoints, selectedSheepRttPoint])

    return <div style={{position: 'absolute', top: 0, bottom: 0, width: '100%', borderRadius: 8}} ref={mapContainerRef} />
}
