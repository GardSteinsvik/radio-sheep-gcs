import {MAVLinkMessage} from '@ifrunistuttgart/node-mavlink';
import {readInt64LE, readUInt64LE} from '@ifrunistuttgart/node-mavlink';
import {ParamAck} from '../enums/param-ack';
import {MavParamExtType} from '../enums/mav-param-ext-type';
/*
Response from a PARAM_EXT_SET_TRIMMED message.
*/
// param_result Result code. uint8_t
// param_type Parameter type. uint8_t
// param_id Parameter id, terminated by NULL if the length is less than 16 human-readable chars and WITHOUT null termination (NULL) byte if the length is exactly 16 chars - applications have to provide 16+1 bytes storage if the ID is stored as string char
// param_value Parameter value (new value if PARAM_ACK_ACCEPTED, current value otherwise, zeros get trimmed) char
export class ParamExtAckTrimmed extends MAVLinkMessage {
	public param_result!: ParamAck;
	public param_type!: MavParamExtType;
	public param_id!: string;
	public param_value!: string;
	public _message_id: number = 327;
	public _message_name: string = 'PARAM_EXT_ACK_TRIMMED';
	public _crc_extra: number = 129;
	public _message_fields: [string, string, boolean][] = [
		['param_result', 'uint8_t', false],
		['param_type', 'uint8_t', false],
		['param_id', 'char', false],
		['param_value', 'char', false],
	];
}
