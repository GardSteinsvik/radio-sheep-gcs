import {BBox} from "geojson";

export interface ElevationProfile {
    bbox: BBox,
    height: number,
    width: number
}
