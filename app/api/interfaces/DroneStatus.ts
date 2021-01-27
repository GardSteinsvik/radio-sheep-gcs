export interface DroneStatus {
    connected?: boolean,
    armed?: boolean,
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
