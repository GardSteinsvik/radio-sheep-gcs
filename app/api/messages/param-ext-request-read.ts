import {MAVLinkMessage} from '@ifrunistuttgart/node-mavlink';
import {readInt64LE, readUInt64LE} from '@ifrunistuttgart/node-mavlink';
/*
Request to read the value of a parameter with either the param_id string id or param_index. PARAM_EXT_VALUE or PARAM_EXT_VALUE_TRIMMED should be emitted in response (see field: trimmed).
*/
// target_system System ID uint8_t
// target_component Component ID uint8_t
// param_id Parameter id, terminated by NULL if the length is less than 16 human-readable chars and WITHOUT null termination (NULL) byte if the length is exactly 16 chars - applications have to provide 16+1 bytes storage if the ID is stored as string char
// param_index Parameter index. Set to -1 to use the Parameter ID field as identifier (else param_id will be ignored) int16_t
// trimmed Request _TRIMMED variants of PARAM_EXT_ messages. Set to 1 if _TRIMMED message variants are supported, and 0 otherwise. This signals the recipient that _TRIMMED messages are supported by the sender (and should be used if supported by the recipient). uint8_t
export class ParamExtRequestRead extends MAVLinkMessage {
	public target_system!: number;
	public target_component!: number;
	public param_id!: string;
	public param_index!: number;
	public trimmed!: number;
	public _message_id: number = 320;
	public _message_name: string = 'PARAM_EXT_REQUEST_READ';
	public _crc_extra: number = 243;
	public _message_fields: [string, string, boolean][] = [
		['param_index', 'int16_t', false],
		['target_system', 'uint8_t', false],
		['target_component', 'uint8_t', false],
		['param_id', 'char', false],
		['trimmed', 'uint8_t', true],
	];
}
