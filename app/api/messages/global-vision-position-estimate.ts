import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Global position/attitude estimate from a vision source.
*/
// usec Timestamp (UNIX time or since system boot) uint64_t
// x Global X position float
// y Global Y position float
// z Global Z position float
// roll Roll angle float
// pitch Pitch angle float
// yaw Yaw angle float
// covariance Row-major representation of pose 6x6 cross-covariance matrix upper right triangle (states: x_global, y_global, z_global, roll, pitch, yaw; first six entries are the first ROW, next five entries are the second ROW, etc.). If unknown, assign NaN value to first element in the array. float
// reset_counter Estimate reset counter. This should be incremented when the estimate resets in any of the dimensions (position, velocity, attitude, angular speed). This is designed to be used when e.g an external SLAM system detects a loop-closure and the estimate jumps. uint8_t
export class GlobalVisionPositionEstimate extends MAVLinkMessage {
	public usec!: number;
	public x!: number;
	public y!: number;
	public z!: number;
	public roll!: number;
	public pitch!: number;
	public yaw!: number;
	public covariance!: number[];
	public reset_counter!: number;
	public _message_id: number = 101;
	public _message_name: string = 'GLOBAL_VISION_POSITION_ESTIMATE';
	public _crc_extra: number = 102;
	public _message_fields: [string, string, boolean, number][] = [
		['usec', 'uint64_t', false, 0],
		['x', 'float', false, 0],
		['y', 'float', false, 0],
		['z', 'float', false, 0],
		['roll', 'float', false, 0],
		['pitch', 'float', false, 0],
		['yaw', 'float', false, 0],
		['covariance', 'float', true, 21],
		['reset_counter', 'uint8_t', true, 0],
	];
}
