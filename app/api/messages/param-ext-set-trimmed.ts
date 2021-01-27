import {MAVLinkMessage} from '@ifrunistuttgart/node-mavlink';
import {readInt64LE, readUInt64LE} from '@ifrunistuttgart/node-mavlink';
import {MavParamExtType} from '../enums/mav-param-ext-type';
/*
Set a parameter value. In order to deal with message loss (and retransmission of PARAM_EXT_SET_TRIMMED), when setting a parameter value and the new value is the same as the current value, you will immediately get a PARAM_ACK_ACCEPTED response. If the current state is PARAM_ACK_IN_PROGRESS, you will accordingly receive a PARAM_ACK_IN_PROGRESS in response. If there is no response to this message, and it is unknown whether the _TRIMMED messages are supported (because no PARAM_EXT_REQUEST_READ or PARAM_EXT_REQUEST_LIST has been performed yet), then fall back to PARAM_EXT_SET.
*/
// target_system System ID uint8_t
// target_component Component ID uint8_t
// param_type Parameter type. uint8_t
// param_id Parameter id, terminated by NULL if the length is less than 16 human-readable chars and WITHOUT null termination (NULL) byte if the length is exactly 16 chars - applications have to provide 16+1 bytes storage if the ID is stored as string char
// param_value Parameter value (zeros get trimmed) char
export class ParamExtSetTrimmed extends MAVLinkMessage {
	public target_system!: number;
	public target_component!: number;
	public param_type!: MavParamExtType;
	public param_id!: string;
	public param_value!: string;
	public _message_id: number = 326;
	public _message_name: string = 'PARAM_EXT_SET_TRIMMED';
	public _crc_extra: number = 120;
	public _message_fields: [string, string, boolean][] = [
		['target_system', 'uint8_t', false],
		['target_component', 'uint8_t', false],
		['param_type', 'uint8_t', false],
		['param_id', 'char', false],
		['param_value', 'char', false],
	];
}
