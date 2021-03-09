import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
The RAW values of the RC channels sent to the MAV to override info received from the RC radio. The standard PPM modulation is as follows: 1000 microseconds: 0%, 2000 microseconds: 100%. Individual receivers/transmitters might violate this specification.  Note carefully the semantic differences between the first 8 channels and the subsequent channels
*/
// target_system System ID uint8_t
// target_component Component ID uint8_t
// chan1_raw RC channel 1 value. A value of UINT16_MAX means to ignore this field. A value of 0 means to release this channel back to the RC radio. uint16_t
// chan2_raw RC channel 2 value. A value of UINT16_MAX means to ignore this field. A value of 0 means to release this channel back to the RC radio. uint16_t
// chan3_raw RC channel 3 value. A value of UINT16_MAX means to ignore this field. A value of 0 means to release this channel back to the RC radio. uint16_t
// chan4_raw RC channel 4 value. A value of UINT16_MAX means to ignore this field. A value of 0 means to release this channel back to the RC radio. uint16_t
// chan5_raw RC channel 5 value. A value of UINT16_MAX means to ignore this field. A value of 0 means to release this channel back to the RC radio. uint16_t
// chan6_raw RC channel 6 value. A value of UINT16_MAX means to ignore this field. A value of 0 means to release this channel back to the RC radio. uint16_t
// chan7_raw RC channel 7 value. A value of UINT16_MAX means to ignore this field. A value of 0 means to release this channel back to the RC radio. uint16_t
// chan8_raw RC channel 8 value. A value of UINT16_MAX means to ignore this field. A value of 0 means to release this channel back to the RC radio. uint16_t
// chan9_raw RC channel 9 value. A value of 0 or UINT16_MAX means to ignore this field. A value of UINT16_MAX-1 means to release this channel back to the RC radio. uint16_t
// chan10_raw RC channel 10 value. A value of 0 or UINT16_MAX means to ignore this field. A value of UINT16_MAX-1 means to release this channel back to the RC radio. uint16_t
// chan11_raw RC channel 11 value. A value of 0 or UINT16_MAX means to ignore this field. A value of UINT16_MAX-1 means to release this channel back to the RC radio. uint16_t
// chan12_raw RC channel 12 value. A value of 0 or UINT16_MAX means to ignore this field. A value of UINT16_MAX-1 means to release this channel back to the RC radio. uint16_t
// chan13_raw RC channel 13 value. A value of 0 or UINT16_MAX means to ignore this field. A value of UINT16_MAX-1 means to release this channel back to the RC radio. uint16_t
// chan14_raw RC channel 14 value. A value of 0 or UINT16_MAX means to ignore this field. A value of UINT16_MAX-1 means to release this channel back to the RC radio. uint16_t
// chan15_raw RC channel 15 value. A value of 0 or UINT16_MAX means to ignore this field. A value of UINT16_MAX-1 means to release this channel back to the RC radio. uint16_t
// chan16_raw RC channel 16 value. A value of 0 or UINT16_MAX means to ignore this field. A value of UINT16_MAX-1 means to release this channel back to the RC radio. uint16_t
// chan17_raw RC channel 17 value. A value of 0 or UINT16_MAX means to ignore this field. A value of UINT16_MAX-1 means to release this channel back to the RC radio. uint16_t
// chan18_raw RC channel 18 val1ue. A value of 0 or UINT16_MAX means to ignore this field. A value of UINT16_MAX-1 means to release this channel back to the RC radio. uint16_t
export class RcChannelsOverride extends MAVLinkMessage {
	public target_system!: number;
	public target_component!: number;
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
	public _message_id: number = 70;
	public _message_name: string = 'RC_CHANNELS_OVERRIDE';
	public _crc_extra: number = 124;
	public _message_fields: [string, string, boolean, number][] = [
		['chan1_raw', 'uint16_t', false, 0],
		['chan2_raw', 'uint16_t', false, 0],
		['chan3_raw', 'uint16_t', false, 0],
		['chan4_raw', 'uint16_t', false, 0],
		['chan5_raw', 'uint16_t', false, 0],
		['chan6_raw', 'uint16_t', false, 0],
		['chan7_raw', 'uint16_t', false, 0],
		['chan8_raw', 'uint16_t', false, 0],
		['target_system', 'uint8_t', false, 0],
		['target_component', 'uint8_t', false, 0],
		['chan9_raw', 'uint16_t', true, 0],
		['chan10_raw', 'uint16_t', true, 0],
		['chan11_raw', 'uint16_t', true, 0],
		['chan12_raw', 'uint16_t', true, 0],
		['chan13_raw', 'uint16_t', true, 0],
		['chan14_raw', 'uint16_t', true, 0],
		['chan15_raw', 'uint16_t', true, 0],
		['chan16_raw', 'uint16_t', true, 0],
		['chan17_raw', 'uint16_t', true, 0],
		['chan18_raw', 'uint16_t', true, 0],
	];
}
