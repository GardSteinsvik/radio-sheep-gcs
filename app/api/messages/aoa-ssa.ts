import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Angle of Attack and Side Slip Angle.
*/
// time_usec Timestamp (since boot or Unix epoch). uint64_t
// AOA Angle of Attack. float
// SSA Side Slip Angle. float
export class AoaSsa extends MAVLinkMessage {
	public time_usec!: number;
	public AOA!: number;
	public SSA!: number;
	public _message_id: number = 11020;
	public _message_name: string = 'AOA_SSA';
	public _crc_extra: number = 205;
	public _message_fields: [string, string, boolean, number][] = [
		['time_usec', 'uint64_t', false, 0],
		['AOA', 'float', false, 0],
		['SSA', 'float', false, 0],
	];
}
