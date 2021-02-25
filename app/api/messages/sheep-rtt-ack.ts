import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
/*
Message used to acknowledge receiving of SHEEP_RTT_DATA packet at the GCS.
*/
// seq Sequential sample id (from power on). uint32_t
export class SheepRttAck extends MAVLinkMessage {
	public seq!: number;
	public _message_id: number = 19201;
	public _message_name: string = 'SHEEP_RTT_ACK';
	public _crc_extra: number = 13;
	public _message_fields: [string, string, boolean][] = [
		['seq', 'uint32_t', false],
	];
}
