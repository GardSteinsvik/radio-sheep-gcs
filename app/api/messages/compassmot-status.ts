import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Status of compassmot calibration.
*/
// throttle Throttle. uint16_t
// current Current. float
// interference Interference. uint16_t
// CompensationX Motor Compensation X. float
// CompensationY Motor Compensation Y. float
// CompensationZ Motor Compensation Z. float
export class CompassmotStatus extends MAVLinkMessage {
	public throttle!: number;
	public current!: number;
	public interference!: number;
	public CompensationX!: number;
	public CompensationY!: number;
	public CompensationZ!: number;
	public _message_id: number = 177;
	public _message_name: string = 'COMPASSMOT_STATUS';
	public _crc_extra: number = 240;
	public _message_fields: [string, string, boolean, number][] = [
		['current', 'float', false, 0],
		['CompensationX', 'float', false, 0],
		['CompensationY', 'float', false, 0],
		['CompensationZ', 'float', false, 0],
		['throttle', 'uint16_t', false, 0],
		['interference', 'uint16_t', false, 0],
	];
}
