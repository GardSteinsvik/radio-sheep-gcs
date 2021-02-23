import {MissionItemInt} from "./messages/mission-item-int";
import {MavFrame} from "./enums/mav-frame";
import {MavCmd} from "./enums/mav-cmd";
import {MavMissionType} from "./enums/mav-mission-type";
import {MavComponent} from "./enums/mav-component";
import {PrecisionLandMode} from "./enums/precision-land-mode";

const GCS_SYSTEM_ID = 255
const GCS_COMP_ID = MavComponent.MAV_COMP_ID_MISSIONPLANNER

const MISSION_ITEM_BASE = {
    frame: MavFrame.MAV_FRAME_GLOBAL_RELATIVE_ALT,
    mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
    autocontinue: 1,
    current: 0,
    target_component: 1,
    target_system: 1,
    param1: 0,
    param2: 0,
    param3: 0,
    param4: 0,
    x: 0,
    y: 0,
    z: 0,
}

export function createTakeOffCommand(seq: number, x: number, y: number, z: number): MissionItemInt {
    return Object.assign(new MissionItemInt(GCS_SYSTEM_ID, GCS_COMP_ID), MISSION_ITEM_BASE, {
        command: MavCmd.MAV_CMD_NAV_TAKEOFF,
        seq,
        x: Math.floor(x * 1e7),
        y: Math.floor(y * 1e7),
        z: 0,
    })
}

export function createLandCommand(seq: number, x: number, y: number): MissionItemInt {
    return Object.assign(new MissionItemInt(GCS_SYSTEM_ID, GCS_COMP_ID), MISSION_ITEM_BASE, {
        command: MavCmd.MAV_CMD_NAV_LAND,
        seq,
        param2: PrecisionLandMode.PRECISION_LAND_MODE_DISABLED,
        x: Math.floor(x * 1e7),
        y: Math.floor(y * 1e7),
    })
}

export function createDoChangeSpeedCommand(seq: number, speed: number): MissionItemInt {
    return Object.assign(new MissionItemInt(GCS_SYSTEM_ID, GCS_COMP_ID), MISSION_ITEM_BASE, {
        command: MavCmd.MAV_CMD_DO_CHANGE_SPEED,
        seq,
        param2: speed,
    })
}

export function createWaypointCommand(seq: number, acceptanceRadius: number, x: number, y: number, z: number): MissionItemInt {
    return Object.assign(new MissionItemInt(GCS_SYSTEM_ID, GCS_COMP_ID), MISSION_ITEM_BASE, {
        command: MavCmd.MAV_CMD_NAV_WAYPOINT,
        seq,
        param1: 0, // Hold time
        param2: acceptanceRadius, // Accept radius
        param3: 0, // Pass radius. 0 to pass through the WP, if > 0 radius to pass by WP. Positive value for clockwise orbit, negative value for counter-clockwise orbit. Allows trajectory control.
        param4: 0, // Yaw
        x: Math.floor(x * 1e7),
        y: Math.floor(y * 1e7),
        z,
    })
}


