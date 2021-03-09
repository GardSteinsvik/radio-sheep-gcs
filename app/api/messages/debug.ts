import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Send a debug value. The index is used to discriminate between values. These values show up in the plot of QGroundControl as DEBUG N.
*/
// time_boot_ms Timestamp (time since system boot). uint32_t
// ind index of debug variable uint8_t
// value DEBUG value float
export class Debug extends MAVLinkMessage {
	public time_boot_ms!: number;
	public ind!: number;
	public value!: number;
	public _message_id: number = 254;
	public _message_name: string = 'DEBUG';
	public _crc_extra: number = 46;
	public _message_fields: [string, string, boolean, number][] = [
		['time_boot_ms', 'uint32_t', false, 0],
		['value', 'float', false, 0],
		['ind', 'uint8_t', false, 0],
	];
}
