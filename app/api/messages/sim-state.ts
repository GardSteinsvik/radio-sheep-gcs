import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Status of simulation environment, if used
*/
// q1 True attitude quaternion component 1, w (1 in null-rotation) float
// q2 True attitude quaternion component 2, x (0 in null-rotation) float
// q3 True attitude quaternion component 3, y (0 in null-rotation) float
// q4 True attitude quaternion component 4, z (0 in null-rotation) float
// roll Attitude roll expressed as Euler angles, not recommended except for human-readable outputs float
// pitch Attitude pitch expressed as Euler angles, not recommended except for human-readable outputs float
// yaw Attitude yaw expressed as Euler angles, not recommended except for human-readable outputs float
// xacc X acceleration float
// yacc Y acceleration float
// zacc Z acceleration float
// xgyro Angular speed around X axis float
// ygyro Angular speed around Y axis float
// zgyro Angular speed around Z axis float
// lat Latitude float
// lon Longitude float
// alt Altitude float
// std_dev_horz Horizontal position standard deviation float
// std_dev_vert Vertical position standard deviation float
// vn True velocity in north direction in earth-fixed NED frame float
// ve True velocity in east direction in earth-fixed NED frame float
// vd True velocity in down direction in earth-fixed NED frame float
export class SimState extends MAVLinkMessage {
	public q1!: number;
	public q2!: number;
	public q3!: number;
	public q4!: number;
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
	public lon!: number;
	public alt!: number;
	public std_dev_horz!: number;
	public std_dev_vert!: number;
	public vn!: number;
	public ve!: number;
	public vd!: number;
	public _message_id: number = 108;
	public _message_name: string = 'SIM_STATE';
	public _crc_extra: number = 32;
	public _message_fields: [string, string, boolean, number][] = [
		['q1', 'float', false, 0],
		['q2', 'float', false, 0],
		['q3', 'float', false, 0],
		['q4', 'float', false, 0],
		['roll', 'float', false, 0],
		['pitch', 'float', false, 0],
		['yaw', 'float', false, 0],
		['xacc', 'float', false, 0],
		['yacc', 'float', false, 0],
		['zacc', 'float', false, 0],
		['xgyro', 'float', false, 0],
		['ygyro', 'float', false, 0],
		['zgyro', 'float', false, 0],
		['lat', 'float', false, 0],
		['lon', 'float', false, 0],
		['alt', 'float', false, 0],
		['std_dev_horz', 'float', false, 0],
		['std_dev_vert', 'float', false, 0],
		['vn', 'float', false, 0],
		['ve', 'float', false, 0],
		['vd', 'float', false, 0],
	];
}
