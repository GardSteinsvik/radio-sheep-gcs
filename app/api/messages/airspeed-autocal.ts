import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Airspeed auto-calibration.
*/
// vx GPS velocity north. float
// vy GPS velocity east. float
// vz GPS velocity down. float
// diff_pressure Differential pressure. float
// EAS2TAS Estimated to true airspeed ratio. float
// ratio Airspeed ratio. float
// state_x EKF state x. float
// state_y EKF state y. float
// state_z EKF state z. float
// Pax EKF Pax. float
// Pby EKF Pby. float
// Pcz EKF Pcz. float
export class AirspeedAutocal extends MAVLinkMessage {
	public vx!: number;
	public vy!: number;
	public vz!: number;
	public diff_pressure!: number;
	public EAS2TAS!: number;
	public ratio!: number;
	public state_x!: number;
	public state_y!: number;
	public state_z!: number;
	public Pax!: number;
	public Pby!: number;
	public Pcz!: number;
	public _message_id: number = 174;
	public _message_name: string = 'AIRSPEED_AUTOCAL';
	public _crc_extra: number = 167;
	public _message_fields: [string, string, boolean, number][] = [
		['vx', 'float', false, 0],
		['vy', 'float', false, 0],
		['vz', 'float', false, 0],
		['diff_pressure', 'float', false, 0],
		['EAS2TAS', 'float', false, 0],
		['ratio', 'float', false, 0],
		['state_x', 'float', false, 0],
		['state_y', 'float', false, 0],
		['state_z', 'float', false, 0],
		['Pax', 'float', false, 0],
		['Pby', 'float', false, 0],
		['Pcz', 'float', false, 0],
	];
}
