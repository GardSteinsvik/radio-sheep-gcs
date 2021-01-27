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
