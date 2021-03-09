import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
import {OsdParamConfigType} from '../enums/osd-param-config-type';
/*
Configure an OSD parameter slot.
*/
// target_system System ID. uint8_t
// target_component Component ID. uint8_t
// request_id Request ID - copied to reply. uint32_t
// osd_screen OSD parameter screen index. uint8_t
// osd_index OSD parameter display index. uint8_t
// param_id Onboard parameter id, terminated by NULL if the length is less than 16 human-readable chars and WITHOUT null termination (NULL) byte if the length is exactly 16 chars - applications have to provide 16+1 bytes storage if the ID is stored as string char
// config_type Config type. uint8_t
// min_value OSD parameter minimum value. float
// max_value OSD parameter maximum value. float
// increment OSD parameter increment. float
export class OsdParamConfig extends MAVLinkMessage {
	public target_system!: number;
	public target_component!: number;
	public request_id!: number;
	public osd_screen!: number;
	public osd_index!: number;
	public param_id!: string;
	public config_type!: OsdParamConfigType;
	public min_value!: number;
	public max_value!: number;
	public increment!: number;
	public _message_id: number = 11033;
	public _message_name: string = 'OSD_PARAM_CONFIG';
	public _crc_extra: number = 195;
	public _message_fields: [string, string, boolean, number][] = [
		['request_id', 'uint32_t', false, 0],
		['min_value', 'float', false, 0],
		['max_value', 'float', false, 0],
		['increment', 'float', false, 0],
		['target_system', 'uint8_t', false, 0],
		['target_component', 'uint8_t', false, 0],
		['osd_screen', 'uint8_t', false, 0],
		['osd_index', 'uint8_t', false, 0],
		['param_id', 'char', false, 16],
		['config_type', 'uint8_t', false, 0],
	];
}
