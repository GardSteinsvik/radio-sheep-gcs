import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Status of third AHRS filter if available. This is for ANU research group (Ali and Sean).
*/
// roll Roll angle. float
// pitch Pitch angle. float
// yaw Yaw angle. float
// altitude Altitude (MSL). float
// lat Latitude. int32_t
// lng Longitude. int32_t
// v1 Test variable1. float
// v2 Test variable2. float
// v3 Test variable3. float
// v4 Test variable4. float
export class Ahrs3 extends MAVLinkMessage {
	public roll!: number;
	public pitch!: number;
	public yaw!: number;
	public altitude!: number;
	public lat!: number;
	public lng!: number;
	public v1!: number;
	public v2!: number;
	public v3!: number;
	public v4!: number;
	public _message_id: number = 182;
	public _message_name: string = 'AHRS3';
	public _crc_extra: number = 229;
	public _message_fields: [string, string, boolean, number][] = [
		['roll', 'float', false, 0],
		['pitch', 'float', false, 0],
		['yaw', 'float', false, 0],
		['altitude', 'float', false, 0],
		['lat', 'int32_t', false, 0],
		['lng', 'int32_t', false, 0],
		['v1', 'float', false, 0],
		['v2', 'float', false, 0],
		['v3', 'float', false, 0],
		['v4', 'float', false, 0],
	];
}
