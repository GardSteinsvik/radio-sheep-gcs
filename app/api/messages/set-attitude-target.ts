import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
import {AttitudeTargetTypemask} from '../enums/attitude-target-typemask';
/*
Sets a desired vehicle attitude. Used by an external controller to command the vehicle (manual controller or other system).
*/
// time_boot_ms Timestamp (time since system boot). uint32_t
// target_system System ID uint8_t
// target_component Component ID uint8_t
// type_mask Bitmap to indicate which dimensions should be ignored by the vehicle. uint8_t
// q Attitude quaternion (w, x, y, z order, zero-rotation is 1, 0, 0, 0) float
// body_roll_rate Body roll rate float
// body_pitch_rate Body pitch rate float
// body_yaw_rate Body yaw rate float
// thrust Collective thrust, normalized to 0 .. 1 (-1 .. 1 for vehicles capable of reverse trust) float
export class SetAttitudeTarget extends MAVLinkMessage {
	public time_boot_ms!: number;
	public target_system!: number;
	public target_component!: number;
	public type_mask!: AttitudeTargetTypemask;
	public q!: number[];
	public body_roll_rate!: number;
	public body_pitch_rate!: number;
	public body_yaw_rate!: number;
	public thrust!: number;
	public _message_id: number = 82;
	public _message_name: string = 'SET_ATTITUDE_TARGET';
	public _crc_extra: number = 49;
	public _message_fields: [string, string, boolean, number][] = [
		['time_boot_ms', 'uint32_t', false, 0],
		['q', 'float', false, 4],
		['body_roll_rate', 'float', false, 0],
		['body_pitch_rate', 'float', false, 0],
		['body_yaw_rate', 'float', false, 0],
		['thrust', 'float', false, 0],
		['target_system', 'uint8_t', false, 0],
		['target_component', 'uint8_t', false, 0],
		['type_mask', 'uint8_t', false, 0],
	];
}
