import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
import {RallyFlags} from '../enums/rally-flags';
/*
A rally point. Used to set a point when from GCS -> MAV. Also used to return a point from MAV -> GCS.
*/
// target_system System ID. uint8_t
// target_component Component ID. uint8_t
// idx Point index (first point is 0). uint8_t
// count Total number of points (for sanity checking). uint8_t
// lat Latitude of point. int32_t
// lng Longitude of point. int32_t
// alt Transit / loiter altitude relative to home. int16_t
// break_alt Break altitude relative to home. int16_t
// land_dir Heading to aim for when landing. uint16_t
// flags Configuration flags. uint8_t
export class RallyPoint extends MAVLinkMessage {
	public target_system!: number;
	public target_component!: number;
	public idx!: number;
	public count!: number;
	public lat!: number;
	public lng!: number;
	public alt!: number;
	public break_alt!: number;
	public land_dir!: number;
	public flags!: RallyFlags;
	public _message_id: number = 175;
	public _message_name: string = 'RALLY_POINT';
	public _crc_extra: number = 138;
	public _message_fields: [string, string, boolean, number][] = [
		['lat', 'int32_t', false, 0],
		['lng', 'int32_t', false, 0],
		['alt', 'int16_t', false, 0],
		['break_alt', 'int16_t', false, 0],
		['land_dir', 'uint16_t', false, 0],
		['target_system', 'uint8_t', false, 0],
		['target_component', 'uint8_t', false, 0],
		['idx', 'uint8_t', false, 0],
		['count', 'uint8_t', false, 0],
		['flags', 'uint8_t', false, 0],
	];
}
