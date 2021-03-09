import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
import {MavPowerStatus} from '../enums/mav-power-status';
/*
Power supply status
*/
// Vcc 5V rail voltage. uint16_t
// Vservo Servo rail voltage. uint16_t
// flags Bitmap of power supply status flags. uint16_t
export class PowerStatus extends MAVLinkMessage {
	public Vcc!: number;
	public Vservo!: number;
	public flags!: MavPowerStatus;
	public _message_id: number = 125;
	public _message_name: string = 'POWER_STATUS';
	public _crc_extra: number = 203;
	public _message_fields: [string, string, boolean, number][] = [
		['Vcc', 'uint16_t', false, 0],
		['Vservo', 'uint16_t', false, 0],
		['flags', 'uint16_t', false, 0],
	];
}
