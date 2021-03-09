import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Metrics typically displayed on a HUD for fixed wing aircraft.
*/
// airspeed Vehicle speed in form appropriate for vehicle type. For standard aircraft this is typically calibrated airspeed (CAS) or indicated airspeed (IAS) - either of which can be used by a pilot to estimate stall speed. float
// groundspeed Current ground speed. float
// heading Current heading in compass units (0-360, 0=north). int16_t
// throttle Current throttle setting (0 to 100). uint16_t
// alt Current altitude (MSL). float
// climb Current climb rate. float
export class VfrHud extends MAVLinkMessage {
	public airspeed!: number;
	public groundspeed!: number;
	public heading!: number;
	public throttle!: number;
	public alt!: number;
	public climb!: number;
	public _message_id: number = 74;
	public _message_name: string = 'VFR_HUD';
	public _crc_extra: number = 20;
	public _message_fields: [string, string, boolean, number][] = [
		['airspeed', 'float', false, 0],
		['groundspeed', 'float', false, 0],
		['alt', 'float', false, 0],
		['climb', 'float', false, 0],
		['heading', 'int16_t', false, 0],
		['throttle', 'uint16_t', false, 0],
	];
}
