import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
RPM sensor output.
*/
// rpm1 RPM Sensor1. float
// rpm2 RPM Sensor2. float
export class Rpm extends MAVLinkMessage {
	public rpm1!: number;
	public rpm2!: number;
	public _message_id: number = 226;
	public _message_name: string = 'RPM';
	public _crc_extra: number = 207;
	public _message_fields: [string, string, boolean, number][] = [
		['rpm1', 'float', false, 0],
		['rpm2', 'float', false, 0],
	];
}
