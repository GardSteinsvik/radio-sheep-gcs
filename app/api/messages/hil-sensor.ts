import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
The IMU readings in SI units in NED body frame
*/
// time_usec Timestamp (UNIX Epoch time or time since system boot). The receiving end can infer timestamp format (since 1.1.1970 or since system boot) by checking for the magnitude of the number. uint64_t
// xacc X acceleration float
// yacc Y acceleration float
// zacc Z acceleration float
// xgyro Angular speed around X axis in body frame float
// ygyro Angular speed around Y axis in body frame float
// zgyro Angular speed around Z axis in body frame float
// xmag X Magnetic field float
// ymag Y Magnetic field float
// zmag Z Magnetic field float
// abs_pressure Absolute pressure float
// diff_pressure Differential pressure (airspeed) float
// pressure_alt Altitude calculated from pressure float
// temperature Temperature float
// fields_updated Bitmap for fields that have updated since last message, bit 0 = xacc, bit 12: temperature, bit 31: full reset of attitude/position/velocities/etc was performed in sim. uint32_t
// id Sensor ID (zero indexed). Used for multiple sensor inputs uint8_t
export class HilSensor extends MAVLinkMessage {
	public time_usec!: number;
	public xacc!: number;
	public yacc!: number;
	public zacc!: number;
	public xgyro!: number;
	public ygyro!: number;
	public zgyro!: number;
	public xmag!: number;
	public ymag!: number;
	public zmag!: number;
	public abs_pressure!: number;
	public diff_pressure!: number;
	public pressure_alt!: number;
	public temperature!: number;
	public fields_updated!: number;
	public id!: number;
	public _message_id: number = 107;
	public _message_name: string = 'HIL_SENSOR';
	public _crc_extra: number = 108;
	public _message_fields: [string, string, boolean, number][] = [
		['time_usec', 'uint64_t', false, 0],
		['xacc', 'float', false, 0],
		['yacc', 'float', false, 0],
		['zacc', 'float', false, 0],
		['xgyro', 'float', false, 0],
		['ygyro', 'float', false, 0],
		['zgyro', 'float', false, 0],
		['xmag', 'float', false, 0],
		['ymag', 'float', false, 0],
		['zmag', 'float', false, 0],
		['abs_pressure', 'float', false, 0],
		['diff_pressure', 'float', false, 0],
		['pressure_alt', 'float', false, 0],
		['temperature', 'float', false, 0],
		['fields_updated', 'uint32_t', false, 0],
		['id', 'uint8_t', true, 0],
	];
}
