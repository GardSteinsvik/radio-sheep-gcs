import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
The filtered local position (e.g. fused computer vision and accelerometers). Coordinate frame is right-handed, Z-axis down (aeronautical frame, NED / north-east-down convention)
*/
// time_boot_ms Timestamp (time since system boot). uint32_t
// x X Position float
// y Y Position float
// z Z Position float
// vx X Speed float
// vy Y Speed float
// vz Z Speed float
export class LocalPositionNed extends MAVLinkMessage {
	public time_boot_ms!: number;
	public x!: number;
	public y!: number;
	public z!: number;
	public vx!: number;
	public vy!: number;
	public vz!: number;
	public _message_id: number = 32;
	public _message_name: string = 'LOCAL_POSITION_NED';
	public _crc_extra: number = 185;
	public _message_fields: [string, string, boolean, number][] = [
		['time_boot_ms', 'uint32_t', false, 0],
		['x', 'float', false, 0],
		['y', 'float', false, 0],
		['z', 'float', false, 0],
		['vx', 'float', false, 0],
		['vy', 'float', false, 0],
		['vz', 'float', false, 0],
	];
}
