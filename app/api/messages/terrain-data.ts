import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Terrain data sent from GCS. The lat/lon and grid_spacing must be the same as a lat/lon from a TERRAIN_REQUEST. See terrain protocol docs: https://mavlink.io/en/services/terrain.html
*/
// lat Latitude of SW corner of first grid int32_t
// lon Longitude of SW corner of first grid int32_t
// grid_spacing Grid spacing uint16_t
// gridbit bit within the terrain request mask uint8_t
// data Terrain data MSL int16_t
export class TerrainData extends MAVLinkMessage {
	public lat!: number;
	public lon!: number;
	public grid_spacing!: number;
	public gridbit!: number;
	public data!: number[];
	public _message_id: number = 134;
	public _message_name: string = 'TERRAIN_DATA';
	public _crc_extra: number = 229;
	public _message_fields: [string, string, boolean, number][] = [
		['lat', 'int32_t', false, 0],
		['lon', 'int32_t', false, 0],
		['grid_spacing', 'uint16_t', false, 0],
		['data', 'int16_t', false, 16],
		['gridbit', 'uint8_t', false, 0],
	];
}
