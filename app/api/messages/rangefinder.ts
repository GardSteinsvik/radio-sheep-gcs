import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Rangefinder reporting.
*/
// distance Distance. float
// voltage Raw voltage if available, zero otherwise. float
export class Rangefinder extends MAVLinkMessage {
	public distance!: number;
	public voltage!: number;
	public _message_id: number = 173;
	public _message_name: string = 'RANGEFINDER';
	public _crc_extra: number = 83;
	public _message_fields: [string, string, boolean, number][] = [
		['distance', 'float', false, 0],
		['voltage', 'float', false, 0],
	];
}
