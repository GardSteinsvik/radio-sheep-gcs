import {MAVLinkMessage} from '@gardsteinsvik/node-mavlink';
import {readInt64LE, readUInt64LE} from '@gardsteinsvik/node-mavlink';
import {MavCmd} from '../enums/mav-cmd';
/*
Send a command with up to seven parameters to the MAV. The command microservice is documented at https://mavlink.io/en/services/command.html
*/
// target_system System which should execute the command uint8_t
// target_component Component which should execute the command, 0 for all components uint8_t
// command Command ID (of command to send). uint16_t
// confirmation 0: First transmission of this command. 1-255: Confirmation transmissions (e.g. for kill command) uint8_t
// param1 Parameter 1 (for the specific command). float
// param2 Parameter 2 (for the specific command). float
// param3 Parameter 3 (for the specific command). float
// param4 Parameter 4 (for the specific command). float
// param5 Parameter 5 (for the specific command). float
// param6 Parameter 6 (for the specific command). float
// param7 Parameter 7 (for the specific command). float
export class CommandLong extends MAVLinkMessage {
	public target_system!: number;
	public target_component!: number;
	public command!: MavCmd;
	public confirmation!: number;
	public param1!: number;
	public param2!: number;
	public param3!: number;
	public param4!: number;
	public param5!: number;
	public param6!: number;
	public param7!: number;
	public _message_id: number = 76;
	public _message_name: string = 'COMMAND_LONG';
	public _crc_extra: number = 152;
	public _message_fields: [string, string, boolean, number][] = [
		['param1', 'float', false, 0],
		['param2', 'float', false, 0],
		['param3', 'float', false, 0],
		['param4', 'float', false, 0],
		['param5', 'float', false, 0],
		['param6', 'float', false, 0],
		['param7', 'float', false, 0],
		['command', 'uint16_t', false, 0],
		['target_system', 'uint8_t', false, 0],
		['target_component', 'uint8_t', false, 0],
		['confirmation', 'uint8_t', false, 0],
	];
}
