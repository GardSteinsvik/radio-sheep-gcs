import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
/*
Control vehicle tone generation (buzzer).
*/
// target_system System ID uint8_t
// target_component Component ID uint8_t
// tune tune in board specific format char
// tune2 tune extension (appended to tune) char
export class PlayTune extends MAVLinkMessage {
	public target_system!: number;
	public target_component!: number;
	public tune!: string;
	public tune2!: string;
	public _message_id: number = 258;
	public _message_name: string = 'PLAY_TUNE';
	public _crc_extra: number = 187;
	public _message_fields: [string, string, boolean, number][] = [
		['target_system', 'uint8_t', false, 0],
		['target_component', 'uint8_t', false, 0],
		['tune', 'char', false, 30],
		['tune2', 'char', true, 200],
	];
}
