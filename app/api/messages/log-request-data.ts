import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Request a chunk of a log
*/
// target_system System ID uint8_t
// target_component Component ID uint8_t
// id Log id (from LOG_ENTRY reply) uint16_t
// ofs Offset into the log uint32_t
// count Number of bytes uint32_t
export class LogRequestData extends MAVLinkMessage {
	public target_system!: number;
	public target_component!: number;
	public id!: number;
	public ofs!: number;
	public count!: number;
	public _message_id: number = 119;
	public _message_name: string = 'LOG_REQUEST_DATA';
	public _crc_extra: number = 116;
	public _message_fields: [string, string, boolean, number][] = [
		['ofs', 'uint32_t', false, 0],
		['count', 'uint32_t', false, 0],
		['id', 'uint16_t', false, 0],
		['target_system', 'uint8_t', false, 0],
		['target_component', 'uint8_t', false, 0],
	];
}
