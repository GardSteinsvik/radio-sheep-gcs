import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Status of DCM attitude estimator.
*/
// omegaIx X gyro drift estimate. float
// omegaIy Y gyro drift estimate. float
// omegaIz Z gyro drift estimate. float
// accel_weight Average accel_weight. float
// renorm_val Average renormalisation value. float
// error_rp Average error_roll_pitch value. float
// error_yaw Average error_yaw value. float
export class Ahrs extends MAVLinkMessage {
	public omegaIx!: number;
	public omegaIy!: number;
	public omegaIz!: number;
	public accel_weight!: number;
	public renorm_val!: number;
	public error_rp!: number;
	public error_yaw!: number;
	public _message_id: number = 163;
	public _message_name: string = 'AHRS';
	public _crc_extra: number = 127;
	public _message_fields: [string, string, boolean, number][] = [
		['omegaIx', 'float', false, 0],
		['omegaIy', 'float', false, 0],
		['omegaIz', 'float', false, 0],
		['accel_weight', 'float', false, 0],
		['renorm_val', 'float', false, 0],
		['error_rp', 'float', false, 0],
		['error_yaw', 'float', false, 0],
	];
}
