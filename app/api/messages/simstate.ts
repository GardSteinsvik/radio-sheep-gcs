import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Status of simulation environment, if used.
*/
// roll Roll angle. float
// pitch Pitch angle. float
// yaw Yaw angle. float
// xacc X acceleration. float
// yacc Y acceleration. float
// zacc Z acceleration. float
// xgyro Angular speed around X axis. float
// ygyro Angular speed around Y axis. float
// zgyro Angular speed around Z axis. float
// lat Latitude. int32_t
// lng Longitude. int32_t
export class Simstate extends MAVLinkMessage {
	public roll!: number;
	public pitch!: number;
	public yaw!: number;
	public xacc!: number;
	public yacc!: number;
	public zacc!: number;
	public xgyro!: number;
	public ygyro!: number;
	public zgyro!: number;
	public lat!: number;
	public lng!: number;
	public _message_id: number = 164;
	public _message_name: string = 'SIMSTATE';
	public _crc_extra: number = 154;
	public _message_fields: [string, string, boolean, number][] = [
		['roll', 'float', false, 0],
		['pitch', 'float', false, 0],
		['yaw', 'float', false, 0],
		['xacc', 'float', false, 0],
		['yacc', 'float', false, 0],
		['zacc', 'float', false, 0],
		['xgyro', 'float', false, 0],
		['ygyro', 'float', false, 0],
		['zgyro', 'float', false, 0],
		['lat', 'int32_t', false, 0],
		['lng', 'int32_t', false, 0],
	];
}
