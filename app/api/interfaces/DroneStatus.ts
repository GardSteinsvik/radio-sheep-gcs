import {MavState} from "../enums/mav-state";

export interface DroneStatus {
    connected?: boolean,
    armed?: boolean,
    systemStatus?: MavState,
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
