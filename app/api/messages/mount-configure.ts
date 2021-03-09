import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
import {MavMountMode} from '../enums/mav-mount-mode';
/*
Message to configure a camera mount, directional antenna, etc.
*/
// target_system System ID. uint8_t
// target_component Component ID. uint8_t
// mount_mode Mount operating mode. uint8_t
// stab_roll (1 = yes, 0 = no). uint8_t
// stab_pitch (1 = yes, 0 = no). uint8_t
// stab_yaw (1 = yes, 0 = no). uint8_t
export class MountConfigure extends MAVLinkMessage {
	public target_system!: number;
	public target_component!: number;
	public mount_mode!: MavMountMode;
	public stab_roll!: number;
	public stab_pitch!: number;
	public stab_yaw!: number;
	public _message_id: number = 156;
	public _message_name: string = 'MOUNT_CONFIGURE';
	public _crc_extra: number = 19;
	public _message_fields: [string, string, boolean, number][] = [
		['target_system', 'uint8_t', false, 0],
		['target_component', 'uint8_t', false, 0],
		['mount_mode', 'uint8_t', false, 0],
		['stab_roll', 'uint8_t', false, 0],
		['stab_pitch', 'uint8_t', false, 0],
		['stab_yaw', 'uint8_t', false, 0],
	];
}
