import {MavCmd} from "./enums/mav-cmd"
import {GcsValues} from "./gcs-values"
import {CommandLong} from './messages/command-long'

const COMMAND_LONG_BASE = {
    target_system: 0,
    target_component: 0,
    command: 0,
    confirmation: 0,
    param1: 0,
    param2: 0,
    param3: 0,
    param4: 0,
    param5: 0,
    param6: 0,
    param7: 0,
}

export function createArmCommand(targetSystem: number, targetComponent: number): CommandLong {
    return Object.assign(new CommandLong(GcsValues.SYSTEM_ID, GcsValues.COMPONENT_ID), COMMAND_LONG_BASE, {
        target_system: targetSystem,
        target_component: targetComponent,
        command: MavCmd.MAV_CMD_COMPONENT_ARM_DISARM,
        param1: 1
    })
}

export function createRequestProtocolVersionCommand(targetSystem: number, targetComponent: number): CommandLong {
    return Object.assign(new CommandLong(GcsValues.SYSTEM_ID, GcsValues.COMPONENT_ID), COMMAND_LONG_BASE, {
        target_system: targetSystem,
        target_component: targetComponent,
        command: MavCmd.MAV_CMD_REQUEST_PROTOCOL_VERSION,
        param1: 1
    })
}

export function createMissionStartCommand(targetSystem: number, targetComponent: number): CommandLong {
    return Object.assign(new CommandLong(GcsValues.SYSTEM_ID, GcsValues.COMPONENT_ID), COMMAND_LONG_BASE, {
        target_system: targetSystem,
        target_component: targetComponent,
        command: MavCmd.MAV_CMD_MISSION_START,
    })
}
