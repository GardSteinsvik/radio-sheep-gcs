import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
import {UavionixAdsbRfHealth} from '../enums/uavionix-adsb-rf-health';
/*
Transceiver heartbeat with health report (updated every 10s)
*/
// rfHealth ADS-B transponder messages uint8_t
export class UavionixAdsbTransceiverHealthReport extends MAVLinkMessage {
	public rfHealth!: UavionixAdsbRfHealth;
	public _message_id: number = 10003;
	public _message_name: string = 'UAVIONIX_ADSB_TRANSCEIVER_HEALTH_REPORT';
	public _crc_extra: number = 4;
	public _message_fields: [string, string, boolean, number][] = [
		['rfHealth', 'uint8_t', false, 0],
	];
}
