import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
ESC Telemetry Data for ESCs 9 to 12, matching data sent by BLHeli ESCs.
*/
// temperature Temperature. uint8_t
// voltage Voltage. uint16_t
// current Current. uint16_t
// totalcurrent Total current. uint16_t
// rpm RPM (eRPM). uint16_t
// count count of telemetry packets received (wraps at 65535). uint16_t
export class EscTelemetry9To12 extends MAVLinkMessage {
	public temperature!: number[];
	public voltage!: number[];
	public current!: number[];
	public totalcurrent!: number[];
	public rpm!: number[];
	public count!: number[];
	public _message_id: number = 11032;
	public _message_name: string = 'ESC_TELEMETRY_9_TO_12';
	public _crc_extra: number = 85;
	public _message_fields: [string, string, boolean, number][] = [
		['voltage', 'uint16_t', false, 4],
		['current', 'uint16_t', false, 4],
		['totalcurrent', 'uint16_t', false, 4],
		['rpm', 'uint16_t', false, 4],
		['count', 'uint16_t', false, 4],
		['temperature', 'uint8_t', false, 4],
	];
}
