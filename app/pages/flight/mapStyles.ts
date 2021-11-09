import mapboxgl from 'mapbox-gl'

function createStyle(source: mapboxgl.AnySourceData): mapboxgl.Style {
    return ({
        'version': 8,
        'sources': {
            'kartverket': source,
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
                'id': 'topo4',
                'type': 'raster',
                'source': 'kartverket',
                'paint': {},
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
