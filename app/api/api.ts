import {xmlClient} from './api-client'
import {TerrainData} from "./interfaces/TerrainData";

export async function getTerrainData(latitude: number, longitude: number): Promise<TerrainData> {
    return await xmlClient(`https://wms.geonorge.no/skwms1/wps.elevation2?service=WPS&version=1.0.0&request=Execute&identifier=elevation&datainputs=lat=${latitude};lon=${longitude};epsg=4326`)
        .then((data: any) => {
            // @ts-ignore
            const terrainData: any = Object.fromEntries(data?.executeresponse?.processoutputs?.output.map((output: any) => [output.identifier._text, output.data.literaldata._text]))
            return {
                placeName: terrainData.placename,
                elevation: +terrainData.elevation,
                terrain: terrainData.terrain,
            };
        })

}

export async function getTiffBlob(bbox: any, xLength: any, yLength: any): Promise<Blob | undefined> {
    return await fetch(`https://wms.geonorge.no/skwms1/wms.hoyde-dtm_somlos_prosjekter?REQUEST=GetMap&crs=EPSG:4326&bbox=${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]}&width=${xLength}&height=${yLength}&format=image/geotiff&layers=las_dtm_somlos`)
        .then(async (response: Response) => {
            if (response.ok) {
                return await response.blob()
            }
        })
}
