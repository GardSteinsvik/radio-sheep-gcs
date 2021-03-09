import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Status of secondary AHRS filter if available.
*/
// roll Roll angle. float
// pitch Pitch angle. float
// yaw Yaw angle. float
// altitude Altitude (MSL). float
// lat Latitude. int32_t
// lng Longitude. int32_t
export class Ahrs2 extends MAVLinkMessage {
	public roll!: number;
	public pitch!: number;
	public yaw!: number;
	public altitude!: number;
	public lat!: number;
	public lng!: number;
	public _message_id: number = 178;
	public _message_name: string = 'AHRS2';
	public _crc_extra: number = 47;
	public _message_fields: [string, string, boolean, number][] = [
		['roll', 'float', false, 0],
		['pitch', 'float', false, 0],
		['yaw', 'float', false, 0],
		['altitude', 'float', false, 0],
		['lat', 'int32_t', false, 0],
		['lng', 'int32_t', false, 0],
	];
}
