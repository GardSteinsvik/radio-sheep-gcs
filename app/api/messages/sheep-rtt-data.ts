import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Message containing a sheepRTT sample. Position of the drone and the distance to the tag with a specific id.
*/
// seq Sequential sample id (from power on). uint32_t
// lat Latitude, expressed int32_t
// lon Longitude, expressed int32_t
// alt Altitude (MSL). Note that virtually all GPS modules provide both WGS84 and MSL. int32_t
// dis Distance between the drone and the tag. uint16_t
// tid Identifier for the tag. uint16_t
// rssi Sample signal strength. int8_t
export class SheepRttData extends MAVLinkMessage {
	public seq!: number;
	public lat!: number;
	public lon!: number;
	public alt!: number;
	public dis!: number;
	public tid!: number;
	public rssi!: number;
	public _message_id: number = 19200;
	public _message_name: string = 'SHEEP_RTT_DATA';
	public _crc_extra: number = 25;
	public _message_fields: [string, string, boolean, number][] = [
		['seq', 'uint32_t', false, 0],
		['lat', 'int32_t', false, 0],
		['lon', 'int32_t', false, 0],
		['alt', 'int32_t', false, 0],
		['dis', 'uint16_t', false, 0],
		['tid', 'uint16_t', false, 0],
		['rssi', 'int8_t', false, 0],
	];
}
