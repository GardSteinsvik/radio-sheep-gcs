import mapboxgl from 'mapbox-gl'

function createStyle(source: mapboxgl.AnySourceData): mapboxgl.Style {
    return ({
        'version': 8,
        'sources': {
            'kartverket': source,
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
                'id': 'topo4',
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
    })
}

export const topo4: mapboxgl.Style = createStyle({
    'type': 'raster',
    // 'minzoom': minZoomThreshold,
    'maxzoom': 20,
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
})

export const topo4graatone: mapboxgl.Style = createStyle({
    'type': 'raster',
    // 'minzoom': minZoomThreshold,
    'maxzoom': 20,
    'tiles': [
        'https://opencache.statkart.no/gatekeeper/gk/gk.open_wmts?'
        + 'Service=WMTS&'
        + 'Version=1.0.0&'
        + 'Request=GetTile&'
        + 'Format=image/png&'
        + 'Style=default&'
        + 'Layer=topo4graatone&'
        + 'TileMatrixSet=EPSG:3857&'
        + 'TileMatrix=EPSG:3857:{z}&'
        + 'TileCol={x}&'
        + 'TileRow={y}'
    ],
    'tileSize': 256
})
