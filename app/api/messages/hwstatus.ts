import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Status of key hardware.
*/
// Vcc Board voltage. uint16_t
// I2Cerr I2C error count. uint8_t
export class Hwstatus extends MAVLinkMessage {
	public Vcc!: number;
	public I2Cerr!: number;
	public _message_id: number = 165;
	public _message_name: string = 'HWSTATUS';
	public _crc_extra: number = 21;
	public _message_fields: [string, string, boolean, number][] = [
		['Vcc', 'uint16_t', false, 0],
		['I2Cerr', 'uint8_t', false, 0],
	];
}
