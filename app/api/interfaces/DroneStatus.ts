import {MavState} from "../enums/mav-state";
import {MavModeFlag} from "../enums/mav-mode-flag";

export interface DroneStatus {
    connected?: boolean,
    armed?: boolean,
    systemStatus?: MavState,
    baseMode?: MavModeFlag,
    targetVelocity?: number,
    latitude?: number;
    longitude?: number;
    altitude?: number;
    yaw?: number;
    vx?: number;
    vy?: number;
    vz?: number;
    battery?: number;
    currentMissionItem?: number;
}
