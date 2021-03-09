import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
import {MavMissionType} from '../enums/mav-mission-type';
/*
Delete all mission items at once.
*/
// target_system System ID uint8_t
// target_component Component ID uint8_t
// mission_type Mission type. uint8_t
export class MissionClearAll extends MAVLinkMessage {
	public target_system!: number;
	public target_component!: number;
	public mission_type!: MavMissionType;
	public _message_id: number = 45;
	public _message_name: string = 'MISSION_CLEAR_ALL';
	public _crc_extra: number = 232;
	public _message_fields: [string, string, boolean, number][] = [
		['target_system', 'uint8_t', false, 0],
		['target_component', 'uint8_t', false, 0],
		['mission_type', 'uint8_t', true, 0],
	];
}
