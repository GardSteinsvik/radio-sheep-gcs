import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
The RAW IMU readings for secondary 9DOF sensor setup. This message should contain the scaled values to the described units
*/
// time_boot_ms Timestamp (time since system boot). uint32_t
// xacc X acceleration int16_t
// yacc Y acceleration int16_t
// zacc Z acceleration int16_t
// xgyro Angular speed around X axis int16_t
// ygyro Angular speed around Y axis int16_t
// zgyro Angular speed around Z axis int16_t
// xmag X Magnetic field int16_t
// ymag Y Magnetic field int16_t
// zmag Z Magnetic field int16_t
// temperature Temperature, 0: IMU does not provide temperature values. If the IMU is at 0C it must send 1 (0.01C). int16_t
export class ScaledImu2 extends MAVLinkMessage {
	public time_boot_ms!: number;
	public xacc!: number;
	public yacc!: number;
	public zacc!: number;
	public xgyro!: number;
	public ygyro!: number;
	public zgyro!: number;
	public xmag!: number;
	public ymag!: number;
	public zmag!: number;
	public temperature!: number;
	public _message_id: number = 116;
	public _message_name: string = 'SCALED_IMU2';
	public _crc_extra: number = 76;
	public _message_fields: [string, string, boolean, number][] = [
		['time_boot_ms', 'uint32_t', false, 0],
		['xacc', 'int16_t', false, 0],
		['yacc', 'int16_t', false, 0],
		['zacc', 'int16_t', false, 0],
		['xgyro', 'int16_t', false, 0],
		['ygyro', 'int16_t', false, 0],
		['zgyro', 'int16_t', false, 0],
		['xmag', 'int16_t', false, 0],
		['ymag', 'int16_t', false, 0],
		['zmag', 'int16_t', false, 0],
		['temperature', 'int16_t', true, 0],
	];
}
