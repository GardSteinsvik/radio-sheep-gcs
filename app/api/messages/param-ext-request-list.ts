import {MAVLinkMessage} from '@ifrunistuttgart/node-mavlink';
import {readInt64LE, readUInt64LE} from '@ifrunistuttgart/node-mavlink';
/*
Request all parameters of this component. All parameters should be emitted in response (as PARAM_EXT_VALUE or PARAM_EXT_VALUE_TRIMMED messages - see field: trimmed).
*/
// target_system System ID uint8_t
// target_component Component ID uint8_t
// trimmed Request _TRIMMED variants of PARAM_EXT_ messages. Set to 1 if _TRIMMED message variants are supported, and 0 otherwise. This signals the recipient that _TRIMMED messages are supported by the sender (and should be used if supported by the recipient). uint8_t
export class ParamExtRequestList extends MAVLinkMessage {
	public target_system!: number;
	public target_component!: number;
	public trimmed!: number;
	public _message_id: number = 321;
	public _message_name: string = 'PARAM_EXT_REQUEST_LIST';
	public _crc_extra: number = 88;
	public _message_fields: [string, string, boolean][] = [
		['target_system', 'uint8_t', false],
		['target_component', 'uint8_t', false],
		['trimmed', 'uint8_t', true],
	];
}
