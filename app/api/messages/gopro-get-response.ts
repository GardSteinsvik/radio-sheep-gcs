import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
import {GoproCommand} from '../enums/gopro-command';
import {GoproRequestStatus} from '../enums/gopro-request-status';
/*
Response from a GOPRO_COMMAND get request.
*/
// cmd_id Command ID. uint8_t
// status Status. uint8_t
// value Value. uint8_t
export class GoproGetResponse extends MAVLinkMessage {
	public cmd_id!: GoproCommand;
	public status!: GoproRequestStatus;
	public value!: number[];
	public _message_id: number = 217;
	public _message_name: string = 'GOPRO_GET_RESPONSE';
	public _crc_extra: number = 202;
	public _message_fields: [string, string, boolean, number][] = [
		['cmd_id', 'uint8_t', false, 0],
		['status', 'uint8_t', false, 0],
		['value', 'uint8_t', false, 4],
	];
}
