import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
The PPM values of the RC channels received. The standard PPM modulation is as follows: 1000 microseconds: 0%, 2000 microseconds: 100%.  A value of UINT16_MAX implies the channel is unused. Individual receivers/transmitters might violate this specification.
*/
// time_boot_ms Timestamp (time since system boot). uint32_t
// chancount Total number of RC channels being received. This can be larger than 18, indicating that more channels are available but not given in this message. This value should be 0 when no RC channels are available. uint8_t
// chan1_raw RC channel 1 value. uint16_t
// chan2_raw RC channel 2 value. uint16_t
// chan3_raw RC channel 3 value. uint16_t
// chan4_raw RC channel 4 value. uint16_t
// chan5_raw RC channel 5 value. uint16_t
// chan6_raw RC channel 6 value. uint16_t
// chan7_raw RC channel 7 value. uint16_t
// chan8_raw RC channel 8 value. uint16_t
// chan9_raw RC channel 9 value. uint16_t
// chan10_raw RC channel 10 value. uint16_t
// chan11_raw RC channel 11 value. uint16_t
// chan12_raw RC channel 12 value. uint16_t
// chan13_raw RC channel 13 value. uint16_t
// chan14_raw RC channel 14 value. uint16_t
// chan15_raw RC channel 15 value. uint16_t
// chan16_raw RC channel 16 value. uint16_t
// chan17_raw RC channel 17 value. uint16_t
// chan18_raw RC channel 18 value. uint16_t
// rssi Receive signal strength indicator in device-dependent units/scale. Values: [0-254], 255: invalid/unknown. uint8_t
export class RcChannels extends MAVLinkMessage {
	public time_boot_ms!: number;
	public chancount!: number;
	public chan1_raw!: number;
	public chan2_raw!: number;
	public chan3_raw!: number;
	public chan4_raw!: number;
	public chan5_raw!: number;
	public chan6_raw!: number;
	public chan7_raw!: number;
	public chan8_raw!: number;
	public chan9_raw!: number;
	public chan10_raw!: number;
	public chan11_raw!: number;
	public chan12_raw!: number;
	public chan13_raw!: number;
	public chan14_raw!: number;
	public chan15_raw!: number;
	public chan16_raw!: number;
	public chan17_raw!: number;
	public chan18_raw!: number;
	public rssi!: number;
	public _message_id: number = 65;
	public _message_name: string = 'RC_CHANNELS';
	public _crc_extra: number = 118;
	public _message_fields: [string, string, boolean, number][] = [
		['time_boot_ms', 'uint32_t', false, 0],
		['chan1_raw', 'uint16_t', false, 0],
		['chan2_raw', 'uint16_t', false, 0],
		['chan3_raw', 'uint16_t', false, 0],
		['chan4_raw', 'uint16_t', false, 0],
		['chan5_raw', 'uint16_t', false, 0],
		['chan6_raw', 'uint16_t', false, 0],
		['chan7_raw', 'uint16_t', false, 0],
		['chan8_raw', 'uint16_t', false, 0],
		['chan9_raw', 'uint16_t', false, 0],
		['chan10_raw', 'uint16_t', false, 0],
		['chan11_raw', 'uint16_t', false, 0],
		['chan12_raw', 'uint16_t', false, 0],
		['chan13_raw', 'uint16_t', false, 0],
		['chan14_raw', 'uint16_t', false, 0],
		['chan15_raw', 'uint16_t', false, 0],
		['chan16_raw', 'uint16_t', false, 0],
		['chan17_raw', 'uint16_t', false, 0],
		['chan18_raw', 'uint16_t', false, 0],
		['chancount', 'uint8_t', false, 0],
		['rssi', 'uint8_t', false, 0],
	];
}
