import {MavParamType} from '../enums/mav-param-type'

export interface DroneParameter {
    [id: string]: {
        value: number,
        type: MavParamType,
        index: number,
    }
}

export interface DroneParameters {
    [target: string]: DroneParameter,
}
