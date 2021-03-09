import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Send a key-value pair as integer. The use of this message is discouraged for normal packets, but a quite efficient way for testing new messages and getting experimental debug output.
*/
// time_boot_ms Timestamp (time since system boot). uint32_t
// name Name of the debug variable char
// value Signed integer value int32_t
export class NamedValueInt extends MAVLinkMessage {
	public time_boot_ms!: number;
	public name!: string;
	public value!: number;
	public _message_id: number = 252;
	public _message_name: string = 'NAMED_VALUE_INT';
	public _crc_extra: number = 44;
	public _message_fields: [string, string, boolean, number][] = [
		['time_boot_ms', 'uint32_t', false, 0],
		['value', 'int32_t', false, 0],
		['name', 'char', false, 10],
	];
}
