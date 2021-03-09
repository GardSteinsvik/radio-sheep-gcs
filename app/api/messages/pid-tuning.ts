import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
import {PidTuningAxis} from '../enums/pid-tuning-axis';
/*
PID tuning information.
*/
// axis Axis. uint8_t
// desired Desired rate. float
// achieved Achieved rate. float
// FF FF component. float
// P P component. float
// I I component. float
// D D component. float
export class PidTuning extends MAVLinkMessage {
	public axis!: PidTuningAxis;
	public desired!: number;
	public achieved!: number;
	public FF!: number;
	public P!: number;
	public I!: number;
	public D!: number;
	public _message_id: number = 194;
	public _message_name: string = 'PID_TUNING';
	public _crc_extra: number = 98;
	public _message_fields: [string, string, boolean, number][] = [
		['desired', 'float', false, 0],
		['achieved', 'float', false, 0],
		['FF', 'float', false, 0],
		['P', 'float', false, 0],
		['I', 'float', false, 0],
		['D', 'float', false, 0],
		['axis', 'uint8_t', false, 0],
	];
}
