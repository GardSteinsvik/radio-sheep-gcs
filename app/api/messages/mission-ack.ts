import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
import {MavMissionResult} from '../enums/mav-mission-result';
import {MavMissionType} from '../enums/mav-mission-type';
/*
Acknowledgment message during waypoint handling. The type field states if this message is a positive ack (type=0) or if an error happened (type=non-zero).
*/
// target_system System ID uint8_t
// target_component Component ID uint8_t
// type Mission result. uint8_t
// mission_type Mission type. uint8_t
export class MissionAck extends MAVLinkMessage {
	public target_system!: number;
	public target_component!: number;
	public type!: MavMissionResult;
	public mission_type!: MavMissionType;
	public _message_id: number = 47;
	public _message_name: string = 'MISSION_ACK';
	public _crc_extra: number = 153;
	public _message_fields: [string, string, boolean, number][] = [
		['target_system', 'uint8_t', false, 0],
		['target_component', 'uint8_t', false, 0],
		['type', 'uint8_t', false, 0],
		['mission_type', 'uint8_t', true, 0],
	];
}
