import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Request a current rally point from MAV. MAV should respond with a RALLY_POINT message. MAV should not respond if the request is invalid.
*/
// target_system System ID. uint8_t
// target_component Component ID. uint8_t
// idx Point index (first point is 0). uint8_t
export class RallyFetchPoint extends MAVLinkMessage {
	public target_system!: number;
	public target_component!: number;
	public idx!: number;
	public _message_id: number = 176;
	public _message_name: string = 'RALLY_FETCH_POINT';
	public _crc_extra: number = 234;
	public _message_fields: [string, string, boolean, number][] = [
		['target_system', 'uint8_t', false, 0],
		['target_component', 'uint8_t', false, 0],
		['idx', 'uint8_t', false, 0],
	];
}
