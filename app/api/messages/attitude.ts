import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
The attitude in the aeronautical frame (right-handed, Z-down, X-front, Y-right).
*/
// time_boot_ms Timestamp (time since system boot). uint32_t
// roll Roll angle (-pi..+pi) float
// pitch Pitch angle (-pi..+pi) float
// yaw Yaw angle (-pi..+pi) float
// rollspeed Roll angular speed float
// pitchspeed Pitch angular speed float
// yawspeed Yaw angular speed float
export class Attitude extends MAVLinkMessage {
	public time_boot_ms!: number;
	public roll!: number;
	public pitch!: number;
	public yaw!: number;
	public rollspeed!: number;
	public pitchspeed!: number;
	public yawspeed!: number;
	public _message_id: number = 30;
	public _message_name: string = 'ATTITUDE';
	public _crc_extra: number = 39;
	public _message_fields: [string, string, boolean, number][] = [
		['time_boot_ms', 'uint32_t', false, 0],
		['roll', 'float', false, 0],
		['pitch', 'float', false, 0],
		['yaw', 'float', false, 0],
		['rollspeed', 'float', false, 0],
		['pitchspeed', 'float', false, 0],
		['yawspeed', 'float', false, 0],
	];
}
