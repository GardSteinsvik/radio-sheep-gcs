import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Data packet, size 16.
*/
// type Data type. uint8_t
// len Data length. uint8_t
// data Raw data. uint8_t
export class Data16 extends MAVLinkMessage {
	public type!: number;
	public len!: number;
	public data!: number[];
	public _message_id: number = 169;
	public _message_name: string = 'DATA16';
	public _crc_extra: number = 234;
	public _message_fields: [string, string, boolean, number][] = [
		['type', 'uint8_t', false, 0],
		['len', 'uint8_t', false, 0],
		['data', 'uint8_t', false, 16],
	];
}
