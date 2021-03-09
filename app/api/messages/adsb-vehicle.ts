import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
import {AdsbAltitudeType} from '../enums/adsb-altitude-type';
import {AdsbEmitterType} from '../enums/adsb-emitter-type';
import {AdsbFlags} from '../enums/adsb-flags';
/*
The location and information of an ADSB vehicle
*/
// ICAO_address ICAO address uint32_t
// lat Latitude int32_t
// lon Longitude int32_t
// altitude_type ADSB altitude type. uint8_t
// altitude Altitude(ASL) int32_t
// heading Course over ground uint16_t
// hor_velocity The horizontal velocity uint16_t
// ver_velocity The vertical velocity. Positive is up int16_t
// callsign The callsign, 8+null char
// emitter_type ADSB emitter type. uint8_t
// tslc Time since last communication in seconds uint8_t
// flags Bitmap to indicate various statuses including valid data fields uint16_t
// squawk Squawk code uint16_t
export class AdsbVehicle extends MAVLinkMessage {
	public ICAO_address!: number;
	public lat!: number;
	public lon!: number;
	public altitude_type!: AdsbAltitudeType;
	public altitude!: number;
	public heading!: number;
	public hor_velocity!: number;
	public ver_velocity!: number;
	public callsign!: string;
	public emitter_type!: AdsbEmitterType;
	public tslc!: number;
	public flags!: AdsbFlags;
	public squawk!: number;
	public _message_id: number = 246;
	public _message_name: string = 'ADSB_VEHICLE';
	public _crc_extra: number = 184;
	public _message_fields: [string, string, boolean, number][] = [
		['ICAO_address', 'uint32_t', false, 0],
		['lat', 'int32_t', false, 0],
		['lon', 'int32_t', false, 0],
		['altitude', 'int32_t', false, 0],
		['heading', 'uint16_t', false, 0],
		['hor_velocity', 'uint16_t', false, 0],
		['ver_velocity', 'int16_t', false, 0],
		['flags', 'uint16_t', false, 0],
		['squawk', 'uint16_t', false, 0],
		['altitude_type', 'uint8_t', false, 0],
		['callsign', 'char', false, 9],
		['emitter_type', 'uint8_t', false, 0],
		['tslc', 'uint8_t', false, 0],
	];
}
