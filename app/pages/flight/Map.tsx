import React, {useEffect, useRef, useState} from 'react';
import mapboxgl, {LngLatLike} from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import {Feature, FeatureCollection, Point, Polygon} from 'geojson'
import {useDispatch, useSelector} from "react-redux";
import {removeSelectedArea, setSelectedArea} from '@slices/selectedAreaSlice'
import {removeSelectedPoint, setSelectedPoint} from '@slices/selectedPointSlice'
import {selectCompletedPoints} from "@slices/completedPointsSlice";
import {selectDroneStatus} from "@slices/droneStatusSlice";
import {DroneStatus} from "@interfaces/DroneStatus";

const SOURCES = {
    COMPLETED_POINTS: 'completed-points',
    DRONE: 'drone',
}

const LAYERS = ({
    SEARCH_AREA: 'search_area',
    POINT: 'point',
    LINE: 'line',
    DRONE: 'drone',
})

interface Props {
    features?: Feature[]
}

export default function Map({features = []}: Props) {

    const dispatch = useDispatch()
    const mapContainerRef = useRef(null);

    const completedPoints = useSelector(selectCompletedPoints)
    const droneStatus = useSelector(selectDroneStatus)

    const [map, setMap] = useState<mapboxgl.Map>()
    const element = document.createElement('div')
    element.className = "drone" // CSS located in app.global.css
    const [droneMarker] = useState<mapboxgl.Marker>(new mapboxgl.Marker(element))

    let DrawControl: MapboxDraw

    function drawDrone(droneStatus: DroneStatus) {
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

            // @ts-ignore
            droneMarker.setLngLat([droneStatus.longitude, droneStatus.latitude]).setRotation(droneStatus.yaw ?? 0).addTo(map)
        }
    }

    function drawCompletedPoints(completedPoints: FeatureCollection<Point>) {
        if (map?.getLayer(SOURCES.COMPLETED_POINTS)) {
            map?.removeLayer(SOURCES.COMPLETED_POINTS)
        }

        if (map?.getSource(SOURCES.COMPLETED_POINTS)) {
            map?.removeSource(SOURCES.COMPLETED_POINTS)
        }

        map?.addSource(SOURCES.COMPLETED_POINTS, {
            type: "geojson",
            data: completedPoints,
        })

        map?.addLayer({
            'id': SOURCES.COMPLETED_POINTS,
            'type': 'circle',
            'source': SOURCES.COMPLETED_POINTS,
            'paint': {
                'circle-radius': 4,
                'circle-color': '#be0952'
            },
            'filter': ['==', '$type', 'Point']
        });
    }

    function drawFeatures(features: Feature[]) {
        [LAYERS.SEARCH_AREA, LAYERS.LINE, LAYERS.POINT].forEach(layerId => {
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
            'id': LAYERS.SEARCH_AREA,
            'type': 'fill',
            'source': 'generated-data',
            'paint': {
                'fill-color': '#37638a',
                'fill-opacity': 0.2
            },
            'filter': ['==', '$type', 'Polygon']
        });

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
                'circle-color': '#00cfff'
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

        console.log(location.origin+__dirname+"/api/countries/{z}/{x}/{y}.pbf")

        const initializeMap = (setMap: Function, mapContainer: any) => {
            const map = new mapboxgl.Map({
                container: mapContainer.current,
                // style: 'mapbox://styles/mapbox/outdoors-v11', // Requires API key
                style: {
                    'version': 8,
                    'sources': {
                        'kartverket': {
                            'type': 'raster',
                            // 'minzoom': minZoomThreshold,
                            'tiles': [
                                'https://opencache.statkart.no/gatekeeper/gk/gk.open_wmts?'
                                + 'Service=WMTS&'
                                + 'Version=1.0.0&'
                                + 'Request=GetTile&'
                                + 'Format=image/png&'
                                + 'Style=default&'
                                + 'Layer=topo4&'
                                + 'TileMatrixSet=EPSG:3857&'
                                + 'TileMatrix=EPSG:3857:{z}&'
                                + 'TileCol={x}&'
                                + 'TileRow={y}'
                            ],
                            'tileSize': 256
                        },
                        'countries': {
                            'type': 'vector',
                            'maxzoom': 6,
                            'tiles': [location.origin+__dirname+"/api/countries/{z}/{x}/{y}.pbf"]
                        },
                    },
                    'layers': [
                        {
                            "id": "background",
                            "type": "background",
                            "paint": {
                                "background-color": "#95b7d9"
                            }
                        },
                        {
                            "id": "country-lines",
                            "type": "line",
                            "source": "countries",
                            "source-layer": "country",
                            "paint": {
                                "line-color": "#fff",
                                "line-width": {
                                    "base":1.5,
                                    "stops": [[0,0],[1,0.8],[2,1]]
                                }
                            }
                        },
                        {
                            'id': 'top4',
                            'type': 'raster',
                            'source': 'kartverket',
                            'paint': {},
                        },
                        {
                            "id": "geo-lines",
                            "type": "line",
                            "source": "countries",
                            "source-layer": "geo-lines",
                            "paint": {
                                "line-color": "#226688",
                                "line-width": {
                                    "stops": [[0,0.2],[4,1]]
                                },
                                "line-dasharray":[6,2]
                            }
                        },
                    ],
                },
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

            map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
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


                map.addControl(DrawControl);
            });

            // Create a popup, but don't add it to the map yet.
            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            map.on('mouseenter', SOURCES.COMPLETED_POINTS, function (e) {
                // Change the cursor style as a UI indicator.
                map.getCanvas().style.cursor = 'pointer';

                const point = e?.features?.[0] as Feature<Point> | undefined
                if (!point) return

                const coordinates = point.geometry.coordinates.slice();
                const description = `
                    <strong>Point #${point.properties?.pointId}</strong>
                    <p>Place name: ${point.properties?.placeName}</p>
                    <p>Elevation: ${point.properties?.elevation}m</p>
                    <p>Terrain type: "${point.properties?.terrain}"</p>
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

            map.on('mouseleave', SOURCES.COMPLETED_POINTS, function () {
                map.getCanvas().style.cursor = '';
                popup.remove();
            });
        }

        if (!map) {
            initializeMap(setMap, mapContainerRef)
        }
    }, [map]);

    useEffect(() => {
        drawFeatures(features)
    }, [features])

    useEffect(() => {
        drawCompletedPoints(completedPoints)
    }, [completedPoints])

    useEffect(() => {
        drawDrone(droneStatus)
    }, [droneStatus])

    return <div style={{position: 'absolute', top: 0, bottom: 0, width: '100%', borderRadius: 8}} ref={mapContainerRef} />
}
