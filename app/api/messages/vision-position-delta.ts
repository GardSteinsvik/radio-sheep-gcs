import {MAVLinkMessage} from '@beyond-vision/node-mavlink';
/*
Camera vision based attitude and position deltas.
*/
// time_usec Timestamp (synced to UNIX time or since system boot). uint64_t
// time_delta_usec Time since the last reported camera frame. uint64_t
// angle_delta Defines a rotation vector in body frame that rotates the vehicle from the previous to the current orientation. float
// position_delta Change in position from previous to current frame rotated into body frame (0=forward, 1=right, 2=down). float
// confidence Normalised confidence value from 0 to 100. float
export class VisionPositionDelta extends MAVLinkMessage {
	public time_usec!: number;
	public time_delta_usec!: number;
	public angle_delta!: number;
	public position_delta!: number;
	public confidence!: number;
	public _message_id: number = 11011;
	public _message_name: string = 'VISION_POSITION_DELTA';
	public _crc_extra: number = 106;
	public _message_fields: [string, string, boolean][] = [
		['time_usec', 'uint64_t', false],
		['time_delta_usec', 'uint64_t', false],
		['angle_delta', 'float', false],
		['position_delta', 'float', false],
		['confidence', 'float', false],
	];
}
