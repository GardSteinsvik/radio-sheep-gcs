import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Sent from simulation to autopilot. This packet is useful for high throughput applications such as hardware in the loop simulations.
*/
// time_usec Timestamp (UNIX Epoch time or time since system boot). The receiving end can infer timestamp format (since 1.1.1970 or since system boot) by checking for the magnitude of the number. uint64_t
// roll Roll angle float
// pitch Pitch angle float
// yaw Yaw angle float
// rollspeed Body frame roll / phi angular speed float
// pitchspeed Body frame pitch / theta angular speed float
// yawspeed Body frame yaw / psi angular speed float
// lat Latitude int32_t
// lon Longitude int32_t
// alt Altitude int32_t
// vx Ground X Speed (Latitude) int16_t
// vy Ground Y Speed (Longitude) int16_t
// vz Ground Z Speed (Altitude) int16_t
// xacc X acceleration int16_t
// yacc Y acceleration int16_t
// zacc Z acceleration int16_t
export class HilState extends MAVLinkMessage {
	public time_usec!: number;
	public roll!: number;
	public pitch!: number;
	public yaw!: number;
	public rollspeed!: number;
	public pitchspeed!: number;
	public yawspeed!: number;
	public lat!: number;
	public lon!: number;
	public alt!: number;
	public vx!: number;
	public vy!: number;
	public vz!: number;
	public xacc!: number;
	public yacc!: number;
	public zacc!: number;
	public _message_id: number = 90;
	public _message_name: string = 'HIL_STATE';
	public _crc_extra: number = 183;
	public _message_fields: [string, string, boolean, number][] = [
		['time_usec', 'uint64_t', false, 0],
		['roll', 'float', false, 0],
		['pitch', 'float', false, 0],
		['yaw', 'float', false, 0],
		['rollspeed', 'float', false, 0],
		['pitchspeed', 'float', false, 0],
		['yawspeed', 'float', false, 0],
		['lat', 'int32_t', false, 0],
		['lon', 'int32_t', false, 0],
		['alt', 'int32_t', false, 0],
		['vx', 'int16_t', false, 0],
		['vy', 'int16_t', false, 0],
		['vz', 'int16_t', false, 0],
		['xacc', 'int16_t', false, 0],
		['yacc', 'int16_t', false, 0],
		['zacc', 'int16_t', false, 0],
	];
}
