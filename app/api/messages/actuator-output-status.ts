import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
The raw values of the actuator outputs (e.g. on Pixhawk, from MAIN, AUX ports). This message supersedes SERVO_OUTPUT_RAW.
*/
// time_usec Timestamp (since system boot). uint64_t
// active Active outputs uint32_t
// actuator Servo / motor output array values. Zero values indicate unused channels. float
export class ActuatorOutputStatus extends MAVLinkMessage {
	public time_usec!: number;
	public active!: number;
	public actuator!: number[];
	public _message_id: number = 375;
	public _message_name: string = 'ACTUATOR_OUTPUT_STATUS';
	public _crc_extra: number = 251;
	public _message_fields: [string, string, boolean, number][] = [
		['time_usec', 'uint64_t', false, 0],
		['active', 'uint32_t', false, 0],
		['actuator', 'float', false, 32],
	];
}
