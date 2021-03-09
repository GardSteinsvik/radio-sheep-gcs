import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Data packet, size 64.
*/
// type Data type. uint8_t
// len Data length. uint8_t
// data Raw data. uint8_t
export class Data64 extends MAVLinkMessage {
	public type!: number;
	public len!: number;
	public data!: number[];
	public _message_id: number = 171;
	public _message_name: string = 'DATA64';
	public _crc_extra: number = 181;
	public _message_fields: [string, string, boolean, number][] = [
		['type', 'uint8_t', false, 0],
		['len', 'uint8_t', false, 0],
		['data', 'uint8_t', false, 64],
	];
}
