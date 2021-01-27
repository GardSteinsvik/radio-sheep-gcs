import events from 'events'
import {Socket} from "net";

import {MAVLinkMessage, MAVLinkModule} from '@ifrunistuttgart/node-mavlink';
import {messageRegistry} from "./message-registry";
import {RequestDataStream} from "./messages/request-data-stream";
import {MavDataStream} from "./enums/mav-data-stream";
import {GlobalPositionInt} from "./messages/global-position-int";
import {SysStatus} from "./messages/sys-status";
import {Feature, FeatureCollection, Point} from "geojson";
import {MissionCount} from "./messages/mission-count";
import {MissionRequest} from "./messages/mission-request";
import {MavMissionType} from "./enums/mav-mission-type";
import {MissionItem} from "./messages/mission-item";
import {MavFrame} from "./enums/mav-frame";
import {MavCmd} from "./enums/mav-cmd";
import {MissionAck} from "./messages/mission-ack";
import {MavMissionResult} from "./enums/mav-mission-result";
import {CommandLong} from "./messages/command-long";
import {FlightParameters} from "./interfaces/FlightParameters";
import {CommandAck} from "./messages/command-ack";
import {MavResult} from "./enums/mav-result";
import {MissionCurrent} from "./messages/mission-current";

const SYSTEM_ID = 1
const COMPONENT_ID = 1

const emitter = new events.EventEmitter()
setTimeout(() => emitter.emit("status_text", "Connection ready."), 0)

const socket = new Socket()
const mavLink = new MAVLinkModule(messageRegistry, SYSTEM_ID, false)

const sentMessages: MAVLinkMessage[] = []

function startConnection(connectionPath: string, connectionPort: number) {
    socket.connect(connectionPort, connectionPath, () => {
        emitter.emit('status_text', 'Connected via tcp:' + connectionPath + ':' + connectionPort)
        emitter.emit('status_data', {connected: true})
        emitter.emit('connecting', false)
        // setTimeout(() => startDataStreams(0, 0, 0, 0, 0, 0, 0, 0), 1000)
        setTimeout(() => startDataStreams(0, 2, 1, 0, 5, 1, 0, 0), 1000)
    })

    socket.on("error", err => emitter.emit('status_text', err.message))
    socket.on("close", () => {
        emitter.emit('status_text', 'Connection closed.')
        emitter.emit('status_data', {connected: false})
        emitter.emit('connecting', false)
        mavLink.removeAllListeners()
        socket.removeAllListeners()
        socket.destroy()
    })

    socket.on('data', data => {
        if (data[0] != 0 && data[1] != 7) {
            // console.log('rssi', data[2])
        }

        mavLink.parse(data)
    })

    mavLink.on('error', function (_: Error) {
        // event listener for node-mavlink ALL error message
        // console.log(e);
    });

    mavLink.on('message', function (message: MAVLinkMessage) {
        const excludedMessages: string[] = [
            'HEARTBEAT',
            'GLOBAL_POSITION_INT',
            'NAV_CONTROLLER_OUTPUT',
            'SYS_STATUS',
            'ATTITUDE',
            'RC_CHANNELS_RAW',
            'GPS_RAW_INT',
            'SERVO_OUTPUT_RAW',
            'MISSION_CURRENT',
            'STATUSTEXT',
            'LOCAL_POSITION_NED',
            'COMMAND_ACK',
        ]

        // event listener for all messages
        if (!excludedMessages.includes(message._message_name)) {
            console.log('Message from drone: ' + message._message_name, message)
        }
    })

    mavLink.on("GLOBAL_POSITION_INT", (globalPositionInt: GlobalPositionInt) => {
        emitter.emit("status_data", {
            longitude: globalPositionInt.lon / 1e7,
            latitude: globalPositionInt.lat / 1e7,
            altitude: globalPositionInt.alt / 1e3,
            yaw: globalPositionInt.hdg / 1e2,
            vx: globalPositionInt.vx / 1e2,
            vy: globalPositionInt.vy / 1e2,
            vz: globalPositionInt.vz / 1e2,
        })
    })

    mavLink.on("SYS_STATUS", (sysStatus: SysStatus) => {
        emitter.emit("status_data", {battery: sysStatus.battery_remaining})
    })

    mavLink.on('MISSION_CURRENT', (missionCurrent: MissionCurrent) => {
        emitter.emit('status_data', {currentMissionItem: missionCurrent.seq})
    })

    mavLink.on('COMMAND_ACK', (commandAck: CommandAck) => {
        const lastRelevantCommand = sentMessages.find(mavLinkMessage => mavLinkMessage.command === commandAck.command) as CommandLong
        switch (commandAck.command) {
            case MavCmd.MAV_CMD_DO_CHANGE_SPEED: {
                if (commandAck.result === MavResult.MAV_RESULT_ACCEPTED) {
                    emitter.emit('status_text', `Target velocity set to ${lastRelevantCommand.param2} m/s.`)
                    emitter.emit('status_data', {targetVelocity: lastRelevantCommand.param2})
                } else {
                    emitter.emit('status_text', 'Failed to set velocity.')
                }
                break
            }
            case MavCmd.MAV_CMD_COMPONENT_ARM_DISARM: {
                if (commandAck.result === MavResult.MAV_RESULT_ACCEPTED) {
                    const armed = !!lastRelevantCommand.param1
                    emitter.emit('status_data', {armed})
                    if (armed) {
                        emitter.emit('status_text', 'Drone armed.')
                    } else {
                        emitter.emit('status_text', 'Drone disarmed.')
                    }
                } else {
                    emitter.emit('status_text', 'Arming/disarming failed.')
                }
                break
            }
            case MavCmd.MAV_CMD_MISSION_START: {
                if (commandAck.result === MavResult.MAV_RESULT_ACCEPTED) {
                    emitter.emit('status_text', 'Mission starting :)')
                } else {
                    emitter.emit('status_text', 'Mission did not start :(')
                }
            }
        }
    })

}

function closeConnection() {
    socket.emit("close")
}

function sendMavlinkMessage(message: MAVLinkMessage) {
    sendMavlinkMessages([message])
}

function sendMavlinkMessages(messages: MAVLinkMessage[]) {
    const buffer = mavLink.pack(messages)
    const status = socket.write(buffer)
    console.log('Sending messages. Status: ' + status, messages)
    if (status) {
        sentMessages.unshift(...messages)
    }
}

function createDataStreamMessage(id: number, rate: number): RequestDataStream {
    return Object.assign(new RequestDataStream(SYSTEM_ID, COMPONENT_ID), {
        target_system: SYSTEM_ID,
        target_component: COMPONENT_ID,
        req_stream_id: id,
        req_message_rate: rate,
        start_stop: 1,
    })
}

function startDataStreams(rawSensorsRate: number, extendedStatusRate: number, rcChannelsRate: number, rawControllerRate: number, positionRate: number, extra1Rate: number, extra2Rate: number, extra3Rate: number) {
    emitter.emit('status_text', 'Starting data streams.')
    sendMavlinkMessages([
        createDataStreamMessage(MavDataStream.MAV_DATA_STREAM_RAW_SENSORS, rawSensorsRate),
        createDataStreamMessage(MavDataStream.MAV_DATA_STREAM_EXTENDED_STATUS, extendedStatusRate),
        createDataStreamMessage(MavDataStream.MAV_DATA_STREAM_RC_CHANNELS, rcChannelsRate),
        createDataStreamMessage(MavDataStream.MAV_DATA_STREAM_RAW_CONTROLLER, rawControllerRate),
        createDataStreamMessage(MavDataStream.MAV_DATA_STREAM_POSITION, positionRate),
        createDataStreamMessage(MavDataStream.MAV_DATA_STREAM_EXTRA1, extra1Rate),
        createDataStreamMessage(MavDataStream.MAV_DATA_STREAM_EXTRA2, extra2Rate),
        createDataStreamMessage(MavDataStream.MAV_DATA_STREAM_EXTRA3, extra3Rate),
    ])
}

function armDrone(arm=1) {
    if (arm) {
        emitter.emit('status_text', 'Arming drone.')
    } else {
        emitter.emit('status_text', 'Disarming drone.')
    }
    sendMavlinkMessage(Object.assign(new CommandLong(SYSTEM_ID, COMPONENT_ID), {
        target_system: SYSTEM_ID,
        target_component: COMPONENT_ID,
        command: MavCmd.MAV_CMD_COMPONENT_ARM_DISARM,
        confirmation: 0,
        param1: arm,
        param2: 0,
    }))
}

function setDroneVelocity(velocity: number) {
    emitter.emit('status_text', `Setting velocity to ${velocity} m/s.`)
    sendMavlinkMessage(Object.assign(new CommandLong(SYSTEM_ID, COMPONENT_ID), {
        target_system: SYSTEM_ID,
        target_component: COMPONENT_ID,
        command: MavCmd.MAV_CMD_DO_CHANGE_SPEED,
        confirmation: 0,
        param1: 0, // Speed type (0=Airspeed, 1=Ground Speed, 2=Climb Speed, 3=Descent Speed)
        param2: velocity, // Speed (-1 indicates no change) m/s
        param3: 0, // Throttle (-1 indicates no change) %
        param4: 0, // Relative (0: absolute, 1: relative)
    }))
}

function uploadMission(flightParameters: FlightParameters, completedPoints: FeatureCollection<Point>) {
    emitter.emit('status_text', 'Uploading mission.')

    if (completedPoints.features.length === 0) {
        completedPoints = {
            type: 'FeatureCollection',
            features: [
                {
                    id: '0',
                    type: 'Feature',
                    properties: {
                        placeName: 'Kongens gate',
                        elevation: 10.1,
                        terrain: 'Åpent område',
                        pointId: '0'
                    },
                    geometry: {
                        coordinates: [
                            10.398316647479959,
                            63.430282829082785
                        ],
                        type: 'Point'
                    }
                },
                {
                    type: 'Feature',
                    properties: {
                        placeName: 'Nordre gate',
                        elevation: 4.4,
                        terrain: 'Bymessig bebyggelse',
                        pointId: '1'
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [
                            10.39707867657947,
                            63.43451735767768
                        ]
                    },
                    id: '1'
                },
                {
                    type: 'Feature',
                    properties: {
                        placeName: 'Brattørveita',
                        elevation: 6.1,
                        terrain: 'Bymessig bebyggelse',
                        pointId: '2'
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [
                            10.403111272966157,
                            63.43451735767768
                        ]
                    },
                    id: '2'
                },
                {
                    type: 'Feature',
                    properties: {
                        placeName: 'Dokkgata',
                        elevation: 3.2,
                        terrain: 'Bymessig bebyggelse',
                        pointId: '3'
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [
                            10.409143869352844,
                            63.43451735767768
                        ]
                    },
                    id: '3'
                },
                {
                    id: '4',
                    type: 'Feature',
                    properties: {
                        placeName: 'Kongens gate',
                        elevation: 10.1,
                        terrain: 'Åpent område',
                        pointId: '4'
                    },
                    geometry: {
                        coordinates: [
                            10.398316647479959,
                            63.430282829082785
                        ],
                        type: 'Point'
                    }
                }
            ]
        }
    }

    const missionItemList: MissionItem[] = []
    const missionItemCount = completedPoints.features.length + 3

    let waypointCounter = 0

    for (let i = 0; i < missionItemCount; i++) {
        const missionItem = Object.assign(new MissionItem(SYSTEM_ID, COMPONENT_ID), {
            seq: i,
            frame: MavFrame.MAV_FRAME_GLOBAL,
            current: 0,
            autocontinue: 1,
            param1: 0,
            param2: 0,
            param3: 0,
            param4: NaN,
            x: 0,
            y: 0,
            z: 0,
            mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
        })

        if (i === 0) {
            Object.assign(missionItem, {
                command: MavCmd.MAV_CMD_NAV_TAKEOFF,
                current: 1,
            })
        } else if (i === 1) {
            Object.assign(missionItem, {
                command: MavCmd.MAV_CMD_DO_CHANGE_SPEED,
                param2: flightParameters.velocity,
            })
        } else if (i === missionItemCount - 1) {
            Object.assign(missionItem, {
                command: MavCmd.MAV_CMD_NAV_LAND,
            })
        } else {
            const currentPoint: Feature<Point> = completedPoints.features[waypointCounter++]
            Object.assign(missionItem, {
                command: MavCmd.MAV_CMD_NAV_WAYPOINT,
                param1: 0, // Hold time
                param2: 5, // Accept radius
                param3: 0, // Pass radius
                param4: NaN, // Yaw
                x: currentPoint.geometry.coordinates[1],
                y: currentPoint.geometry.coordinates[0],
                z: flightParameters.elevation + (currentPoint.properties?.elevation ?? 0),
            })
        }
        missionItemList.push(missionItem)
    }

    const missionCount = new MissionCount(SYSTEM_ID, COMPONENT_ID);
    Object.assign(missionCount, {
        count: missionItemList.length,
        mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
    })
    sendMavlinkMessage(missionCount)

    function missionRequestListener(missionRequest: MissionRequest) {
        sendMavlinkMessage(missionItemList[missionRequest.seq])
    }

    function missionAckListener(missionAck: MissionAck) {
        if (missionAck.type === MavMissionResult.MAV_MISSION_ACCEPTED) {
            emitter.emit('status_text', 'Mission uploaded successfully.')

            // setTimeout(() => startMission(missionItemCount), 500)

            // const missionRequestList = new MissionRequestList(SYSTEM_ID, COMPONENT_ID);
            // Object.assign(missionRequestList, {
            //     target_system: SYSTEM_ID,
            //     target_component: COMPONENT_ID,
            //     mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
            // })
            // sendMavlinkMessage(missionRequestList)

            setTimeout(() => mavLink.removeListener('MISSION_REQUEST', missionRequestListener), 100)
            setTimeout(() => mavLink.removeListener('MISSION_ACK', missionAckListener), 100)
        }
    }

    mavLink.on('MISSION_REQUEST', missionRequestListener)
    mavLink.on('MISSION_ACK', missionAckListener)
}

function startMission() {
    emitter.emit('status_text', 'Starting mission...')
    sendMavlinkMessage(Object.assign(new CommandLong(SYSTEM_ID, COMPONENT_ID), {
        target_system: SYSTEM_ID,
        target_component: COMPONENT_ID,
        command: MavCmd.MAV_CMD_MISSION_START,
        confirmation: 0,
    }))
}

const mav = {
    emitter,
    startConnection,
    closeConnection,
    sendMavlinkMessage,
    armDrone,
    setDroneVelocity,
    uploadMission,
    startMission,
}

export default mav;
