import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Request the autopilot version from the system/component.
*/
// target_system System ID. uint8_t
// target_component Component ID. uint8_t
export class AutopilotVersionRequest extends MAVLinkMessage {
	public target_system!: number;
	public target_component!: number;
	public _message_id: number = 183;
	public _message_name: string = 'AUTOPILOT_VERSION_REQUEST';
	public _crc_extra: number = 85;
	public _message_fields: [string, string, boolean, number][] = [
		['target_system', 'uint8_t', false, 0],
		['target_component', 'uint8_t', false, 0],
	];
}
