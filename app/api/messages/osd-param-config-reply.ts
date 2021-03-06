import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
import {OsdParamConfigError} from '../enums/osd-param-config-error';
/*
Configure OSD parameter reply.
*/
// request_id Request ID - copied from request. uint32_t
// result Config error type. uint8_t
export class OsdParamConfigReply extends MAVLinkMessage {
	public request_id!: number;
	public result!: OsdParamConfigError;
	public _message_id: number = 11034;
	public _message_name: string = 'OSD_PARAM_CONFIG_REPLY';
	public _crc_extra: number = 79;
	public _message_fields: [string, string, boolean, number][] = [
		['request_id', 'uint32_t', false, 0],
		['result', 'uint8_t', false, 0],
	];
}
