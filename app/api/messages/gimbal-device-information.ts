import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
import {GimbalDeviceCapFlags} from '../enums/gimbal-device-cap-flags';
/*
Information about a low level gimbal. This message should be requested by the gimbal manager or a ground station using MAV_CMD_REQUEST_MESSAGE. The maximum angles and rates are the limits by hardware. However, the limits by software used are likely different/smaller and dependent on mode/settings/etc..
*/
// time_boot_ms Timestamp (time since system boot). uint32_t
// vendor_name Name of the gimbal vendor. char
// model_name Name of the gimbal model. char
// custom_name Custom name of the gimbal given to it by the user. char
// firmware_version Version of the gimbal firmware, encoded as: (Dev & 0xff) << 24 | (Patch & 0xff) << 16 | (Minor & 0xff) << 8 | (Major & 0xff). uint32_t
// hardware_version Version of the gimbal hardware, encoded as: (Dev & 0xff) << 24 | (Patch & 0xff) << 16 | (Minor & 0xff) << 8 | (Major & 0xff). uint32_t
// uid UID of gimbal hardware (0 if unknown). uint64_t
// cap_flags Bitmap of gimbal capability flags. uint16_t
// custom_cap_flags Bitmap for use for gimbal-specific capability flags. uint16_t
// roll_min Minimum hardware roll angle (positive: rolling to the right, negative: rolling to the left) float
// roll_max Maximum hardware roll angle (positive: rolling to the right, negative: rolling to the left) float
// pitch_min Minimum hardware pitch angle (positive: up, negative: down) float
// pitch_max Maximum hardware pitch angle (positive: up, negative: down) float
// yaw_min Minimum hardware yaw angle (positive: to the right, negative: to the left) float
// yaw_max Maximum hardware yaw angle (positive: to the right, negative: to the left) float
export class GimbalDeviceInformation extends MAVLinkMessage {
	public time_boot_ms!: number;
	public vendor_name!: string;
	public model_name!: string;
	public custom_name!: string;
	public firmware_version!: number;
	public hardware_version!: number;
	public uid!: number;
	public cap_flags!: GimbalDeviceCapFlags;
	public custom_cap_flags!: number;
	public roll_min!: number;
	public roll_max!: number;
	public pitch_min!: number;
	public pitch_max!: number;
	public yaw_min!: number;
	public yaw_max!: number;
	public _message_id: number = 283;
	public _message_name: string = 'GIMBAL_DEVICE_INFORMATION';
	public _crc_extra: number = 74;
	public _message_fields: [string, string, boolean, number][] = [
		['uid', 'uint64_t', false, 0],
		['time_boot_ms', 'uint32_t', false, 0],
		['firmware_version', 'uint32_t', false, 0],
		['hardware_version', 'uint32_t', false, 0],
		['roll_min', 'float', false, 0],
		['roll_max', 'float', false, 0],
		['pitch_min', 'float', false, 0],
		['pitch_max', 'float', false, 0],
		['yaw_min', 'float', false, 0],
		['yaw_max', 'float', false, 0],
		['cap_flags', 'uint16_t', false, 0],
		['custom_cap_flags', 'uint16_t', false, 0],
		['vendor_name', 'char', false, 32],
		['model_name', 'char', false, 32],
		['custom_name', 'char', false, 32],
	];
}
