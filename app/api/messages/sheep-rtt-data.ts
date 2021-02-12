import {MAVLinkMessage} from '@beyond-vision/node-mavlink';
/*
Message containing a sheepRTT sample. Position of the drone and the distance to the tag with a specific id.
*/
// seq Sequential sample id (from power on). uint32_t
// lat Latitude, expressed int32_t
// lon Longitude, expressed int32_t
// alt Altitude (MSL). Note that virtually all GPS modules provide both WGS84 and MSL. int32_t
// dis Distance between the drone and the tag. uint8_t
// tid Identifier for the tag. uint16_t
export class SheepRttData extends MAVLinkMessage {
	public seq!: number;
	public lat!: number;
	public lon!: number;
	public alt!: number;
	public dis!: number;
	public tid!: number;
	public _message_id: number = 19200;
	public _message_name: string = 'SHEEP_RTT_DATA';
	public _crc_extra: number = 7;
	public _message_fields: [string, string, boolean][] = [
		['seq', 'uint32_t', false],
		['lat', 'int32_t', false],
		['lon', 'int32_t', false],
		['alt', 'int32_t', false],
		['tid', 'uint16_t', false],
		['dis', 'uint8_t', false],
	];
}
