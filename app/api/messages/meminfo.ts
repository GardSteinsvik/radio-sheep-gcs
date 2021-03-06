import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
State of APM memory.
*/
// brkval Heap top. uint16_t
// freemem Free memory. uint16_t
// freemem32 Free memory (32 bit). uint32_t
export class Meminfo extends MAVLinkMessage {
	public brkval!: number;
	public freemem!: number;
	public freemem32!: number;
	public _message_id: number = 152;
	public _message_name: string = 'MEMINFO';
	public _crc_extra: number = 208;
	public _message_fields: [string, string, boolean, number][] = [
		['brkval', 'uint16_t', false, 0],
		['freemem', 'uint16_t', false, 0],
		['freemem32', 'uint32_t', true, 0],
	];
}
