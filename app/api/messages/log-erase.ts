import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
/*
Erase all logs
*/
// target_system System ID uint8_t
// target_component Component ID uint8_t
export class LogErase extends MAVLinkMessage {
	public target_system!: number;
	public target_component!: number;
	public _message_id: number = 121;
	public _message_name: string = 'LOG_ERASE';
	public _crc_extra: number = 237;
	public _message_fields: [string, string, boolean][] = [
		['target_system', 'uint8_t', false],
		['target_component', 'uint8_t', false],
	];
}
