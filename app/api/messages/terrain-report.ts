import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Streamed from drone to report progress of terrain map download (initiated by TERRAIN_REQUEST), or sent as a response to a TERRAIN_CHECK request. See terrain protocol docs: https://mavlink.io/en/services/terrain.html
*/
// lat Latitude int32_t
// lon Longitude int32_t
// spacing grid spacing (zero if terrain at this location unavailable) uint16_t
// terrain_height Terrain height MSL float
// current_height Current vehicle height above lat/lon terrain height float
// pending Number of 4x4 terrain blocks waiting to be received or read from disk uint16_t
// loaded Number of 4x4 terrain blocks in memory uint16_t
export class TerrainReport extends MAVLinkMessage {
	public lat!: number;
	public lon!: number;
	public spacing!: number;
	public terrain_height!: number;
	public current_height!: number;
	public pending!: number;
	public loaded!: number;
	public _message_id: number = 136;
	public _message_name: string = 'TERRAIN_REPORT';
	public _crc_extra: number = 1;
	public _message_fields: [string, string, boolean, number][] = [
		['lat', 'int32_t', false, 0],
		['lon', 'int32_t', false, 0],
		['terrain_height', 'float', false, 0],
		['current_height', 'float', false, 0],
		['spacing', 'uint16_t', false, 0],
		['pending', 'uint16_t', false, 0],
		['loaded', 'uint16_t', false, 0],
	];
}
