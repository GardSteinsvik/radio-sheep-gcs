import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
import {PidTuningAxis} from '../enums/pid-tuning-axis';
/*
Adaptive Controller tuning information.
*/
// axis Axis. uint8_t
// desired Desired rate. float
// achieved Achieved rate. float
// error Error between model and vehicle. float
// theta Theta estimated state predictor. float
// omega Omega estimated state predictor. float
// sigma Sigma estimated state predictor. float
// theta_dot Theta derivative. float
// omega_dot Omega derivative. float
// sigma_dot Sigma derivative. float
// f Projection operator value. float
// f_dot Projection operator derivative. float
// u u adaptive controlled output command. float
export class AdapTuning extends MAVLinkMessage {
	public axis!: PidTuningAxis;
	public desired!: number;
	public achieved!: number;
	public error!: number;
	public theta!: number;
	public omega!: number;
	public sigma!: number;
	public theta_dot!: number;
	public omega_dot!: number;
	public sigma_dot!: number;
	public f!: number;
	public f_dot!: number;
	public u!: number;
	public _message_id: number = 11010;
	public _message_name: string = 'ADAP_TUNING';
	public _crc_extra: number = 46;
	public _message_fields: [string, string, boolean, number][] = [
		['desired', 'float', false, 0],
		['achieved', 'float', false, 0],
		['error', 'float', false, 0],
		['theta', 'float', false, 0],
		['omega', 'float', false, 0],
		['sigma', 'float', false, 0],
		['theta_dot', 'float', false, 0],
		['omega_dot', 'float', false, 0],
		['sigma_dot', 'float', false, 0],
		['f', 'float', false, 0],
		['f_dot', 'float', false, 0],
		['u', 'float', false, 0],
		['axis', 'uint8_t', false, 0],
	];
}
