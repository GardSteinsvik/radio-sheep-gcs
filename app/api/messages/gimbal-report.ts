import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
3 axis gimbal measurements.
*/
// target_system System ID. uint8_t
// target_component Component ID. uint8_t
// delta_time Time since last update. float
// delta_angle_x Delta angle X. float
// delta_angle_y Delta angle Y. float
// delta_angle_z Delta angle X. float
// delta_velocity_x Delta velocity X. float
// delta_velocity_y Delta velocity Y. float
// delta_velocity_z Delta velocity Z. float
// joint_roll Joint ROLL. float
// joint_el Joint EL. float
// joint_az Joint AZ. float
export class GimbalReport extends MAVLinkMessage {
	public target_system!: number;
	public target_component!: number;
	public delta_time!: number;
	public delta_angle_x!: number;
	public delta_angle_y!: number;
	public delta_angle_z!: number;
	public delta_velocity_x!: number;
	public delta_velocity_y!: number;
	public delta_velocity_z!: number;
	public joint_roll!: number;
	public joint_el!: number;
	public joint_az!: number;
	public _message_id: number = 200;
	public _message_name: string = 'GIMBAL_REPORT';
	public _crc_extra: number = 134;
	public _message_fields: [string, string, boolean, number][] = [
		['delta_time', 'float', false, 0],
		['delta_angle_x', 'float', false, 0],
		['delta_angle_y', 'float', false, 0],
		['delta_angle_z', 'float', false, 0],
		['delta_velocity_x', 'float', false, 0],
		['delta_velocity_y', 'float', false, 0],
		['delta_velocity_z', 'float', false, 0],
		['joint_roll', 'float', false, 0],
		['joint_el', 'float', false, 0],
		['joint_az', 'float', false, 0],
		['target_system', 'uint8_t', false, 0],
		['target_component', 'uint8_t', false, 0],
	];
}
