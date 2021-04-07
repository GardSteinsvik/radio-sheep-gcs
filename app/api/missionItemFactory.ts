import {MissionItemInt} from "./messages/mission-item-int";
import {MavFrame} from "./enums/mav-frame";
import {MavCmd} from "./enums/mav-cmd";
import {MavMissionType} from "./enums/mav-mission-type";
import {PrecisionLandMode} from "./enums/precision-land-mode";
import {GcsValues} from "./gcs-values";

const MISSION_ITEM_BASE = {
    frame: MavFrame.MAV_FRAME_GLOBAL,
    mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
    autocontinue: 1,
    current: 0,
    target_component: 1,
    target_system: 1,
    seq: 0,
    param1: 0,
    param2: 0,
    param3: 0,
    param4: 0,
    x: 0,
    y: 0,
    z: 0,
}

export function createTakeOffCommand(x: number, y: number, z: number): MissionItemInt {
    return Object.assign(new MissionItemInt(GcsValues.SYSTEM_ID, GcsValues.COMPONENT_ID), MISSION_ITEM_BASE, {
        command: MavCmd.MAV_CMD_NAV_TAKEOFF,
        x: Math.floor(x * 1e7),
        y: Math.floor(y * 1e7),
        z: 0,
    })
}

export function createLandCommand(x: number, y: number): MissionItemInt {
    return Object.assign(new MissionItemInt(GcsValues.SYSTEM_ID, GcsValues.COMPONENT_ID), MISSION_ITEM_BASE, {
        command: MavCmd.MAV_CMD_NAV_LAND,
        param2: PrecisionLandMode.PRECISION_LAND_MODE_DISABLED,
        x: Math.floor(x * 1e7),
        y: Math.floor(y * 1e7),
    })
}

export function createDoChangeSpeedCommand(speed: number): MissionItemInt {
    return Object.assign(new MissionItemInt(GcsValues.SYSTEM_ID, GcsValues.COMPONENT_ID), MISSION_ITEM_BASE, {
        command: MavCmd.MAV_CMD_DO_CHANGE_SPEED,
        param2: speed,
    })
}

export function createWaypointCommand(acceptanceRadius: number, x: number, y: number, z: number): MissionItemInt {
    return Object.assign(new MissionItemInt(GcsValues.SYSTEM_ID, GcsValues.COMPONENT_ID), MISSION_ITEM_BASE, {
        command: MavCmd.MAV_CMD_NAV_WAYPOINT,
        param1: 0, // Hold time
        param2: acceptanceRadius, // Accept radius
        param3: 0, // Pass radius. 0 to pass through the WP, if > 0 radius to pass by WP. Positive value for clockwise orbit, negative value for counter-clockwise orbit. Allows trajectory control.
        param4: 0, // Yaw
        x: Math.floor(x * 1e7),
        y: Math.floor(y * 1e7),
        z,
    })
}

export function assignSeqNumber(missionItemInt: MissionItemInt, seq: number): MissionItemInt {
    return Object.assign(missionItemInt, {seq})
}
