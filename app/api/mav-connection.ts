import events from 'events'
import {Socket} from "net";

import {MAVLinkMessage, MAVLinkModule} from '@beyond-vision/node-mavlink';
import {messageRegistry} from "./message-registry";
import {RequestDataStream} from "./messages/request-data-stream";
import {MavDataStream} from "./enums/mav-data-stream";
import {GlobalPositionInt} from "./messages/global-position-int";
import {SysStatus} from "./messages/sys-status";
import {Feature, FeatureCollection, Point} from "geojson";
import {MissionCount} from "./messages/mission-count";
import {MavMissionType} from "./enums/mav-mission-type";
import {MavCmd} from "./enums/mav-cmd";
import {MissionAck} from "./messages/mission-ack";
import {MavMissionResult} from "./enums/mav-mission-result";
import {CommandLong} from "./messages/command-long";
import {FlightParameters} from "./interfaces/FlightParameters";
import {CommandAck} from "./messages/command-ack";
import {MavResult} from "./enums/mav-result";
import {MissionCurrent} from "./messages/mission-current";
import {MavComponent} from "./enums/mav-component";
import {MissionItemInt} from "./messages/mission-item-int";
import {MissionRequestInt} from "./messages/mission-request-int";
import {Heartbeat} from "./messages/heartbeat";
import {MavType} from "./enums/mav-type";
import {MavAutopilot} from "./enums/mav-autopilot";
import {Data32} from "./messages/data32";
import {createLandCommand, createTakeOffCommand, createWaypointCommand} from "./missionItemFactory";
import {MissionRequest} from "./messages/mission-request";
import {MissionRequestList} from "./messages/mission-request-list";
import {MissionClearAll} from "./messages/mission-clear-all";
import {SetHomePosition} from "./messages/set-home-position";
import {Statustext} from "./messages/statustext";

const GCS_SYSTEM_ID = 255
const GCS_COMP_ID = MavComponent.MAV_COMP_ID_MISSIONPLANNER
const MAV_SYSTEM_ID = 1 // TODO: Hent fra første heartbeat
const MAV_COMP_ID = MavComponent.MAV_COMP_ID_AUTOPILOT1

const emitter = new events.EventEmitter()
setTimeout(() => emitter.emit("status_text", "Connection ready."), 0)

const socket = new Socket()
const mavLink = new MAVLinkModule(messageRegistry)
mavLink.upgradeLink()

const sentMessages: MAVLinkMessage[] = []
const messageCounts: any = {}

const HEARTBEAT_INTERVAL = 1 // Hz
let intervalId: NodeJS.Timeout
function sendHeartBeat() {
    // console.log("SENDING HEARTBEAT", intervalId)
    const heartbeat = Object.assign(new Heartbeat(GCS_SYSTEM_ID, GCS_COMP_ID), {
        type: MavType.MAV_TYPE_GCS,
        autopilot: MavAutopilot.MAV_AUTOPILOT_INVALID,
        base_mode: 0, // Unknown value for GCS
        custom_mode: 0,
        system_status: 0, // Unknown value for GCS
        mavlink_version: 3,
    })
    const buffer = mavLink.pack([heartbeat])
    const status = socket.write(buffer)
    if (!status) console.log("Failed to send heartbeat.")
}

function startConnection(connectionPath: string, connectionPort: number) {
    socket.connect(connectionPort, connectionPath, () => {
        emitter.emit('status_text', 'Connected via tcp:' + connectionPath + ':' + connectionPort)
        emitter.emit('status_data', {connected: true})
        emitter.emit('connecting', false)
        intervalId = setInterval(sendHeartBeat, HEARTBEAT_INTERVAL * 1000)
        setTimeout(() => startDataStreams(2, 2, 2, 0, 3, 10, 10, 10), 1000)
    })

    socket.on("error", err => emitter.emit('status_text', err.message))
    socket.on("close", () => {
        emitter.emit('status_text', 'Connection closed.')
        emitter.emit('status_data', {connected: false})
        emitter.emit('connecting', false)
        clearInterval(intervalId)
        mavLink.removeAllListeners()
        socket.removeAllListeners()
        socket.destroy()
    })

    socket.on('data', data => {
        mavLink.parse(data)
    })

    mavLink.on('error', function (e: Error) {
        // event listener for node-mavlink ALL error message
        console.log("MAVLINK ON ERROR", e);
    });

    mavLink.on('message', function (message: MAVLinkMessage) {
        messageCounts[message._message_name] = (messageCounts[message._message_name] ?? 0) + 1

        const excludedMessages: string[] = [
            'HEARTBEAT',
            'TIMESYNC',
            'GLOBAL_POSITION_INT',
            'NAV_CONTROLLER_OUTPUT',
            'SYS_STATUS',
            'ATTITUDE',
            'RC_CHANNELS_RAW',
            'GPS_RAW_INT',
            'SERVO_OUTPUT_RAW',
            'MISSION_CURRENT',
            // 'STATUSTEXT',
            'LOCAL_POSITION_NED',
            'COMMAND_ACK',
            'MEMINFO',
            'VIBRATION',
            'WSTATUS',
            'SYSTEM_TIME',
            // 'PARAM_VALUE',
            'EKF_STATUS_REPORT',
            'AHRS',
            'SIMSTATE',
            'AHRS2',
            'SCALED_PRESSURE',
            'SCALED_PRESSURE2',
            'RAW_IMU',
            'HWSTATUS',
            'RC_CHANNELS',
            'TERRAIN_REPORT',
            'BATTERY_STATUS',
            'VFR_HUD',
            'SCALED_IMU2',
            'SCALED_IMU3',
            'HOME_POSITION',
            'POWER_STATUS',
            'TERRAIN_REQUEST',
        ]

        // event listener for all messages
        if (!excludedMessages.includes(message._message_name)) {
            console.log('MESSAGE FROM MAV: ' + message._message_name + ': ', [message])
        }
    })

    mavLink.on('STATUSTEXT', (statusText: Statustext) => {
        console.log('STATUSTEXT: ' + statusText.text)
        if (statusText.text) {
            emitter.emit('status_text', `[MAV] ${statusText.text}`)
        }
    })

    mavLink.on('DATA32', (data32: Data32) => {
        console.log('WE GOT DATA32 BOYS', data32)
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
    return Object.assign(new RequestDataStream(GCS_SYSTEM_ID, GCS_COMP_ID), {
        target_system: MAV_SYSTEM_ID,
        target_component: MAV_COMP_ID,
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
    sendMavlinkMessage(Object.assign(new CommandLong(GCS_SYSTEM_ID, GCS_COMP_ID), {
        target_system: MAV_SYSTEM_ID,
        target_component: MAV_COMP_ID,
        command: MavCmd.MAV_CMD_COMPONENT_ARM_DISARM,
        confirmation: 0,
        param1: arm,
        param2: 0,
        param3: 0,
        param4: 0,
        param5: 0,
        param6: 0,
        param7: 0,
    }))
}

function setDroneVelocity(velocity: number) {
    emitter.emit('status_text', `Setting velocity to ${velocity} m/s.`)
    sendMavlinkMessage(Object.assign(new CommandLong(GCS_SYSTEM_ID, GCS_COMP_ID), {
        target_system: MAV_SYSTEM_ID,
        target_component: MAV_COMP_ID,
        command: MavCmd.MAV_CMD_DO_CHANGE_SPEED,
        confirmation: 0,
        param1: 0, // Speed type (0=Airspeed, 1=Ground Speed, 2=Climb Speed, 3=Descent Speed)
        param2: velocity, // Speed (-1 indicates no change) m/s
        param3: 0, // Throttle (-1 indicates no change) %
        param4: 0, // Relative (0: absolute, 1: relative)
        param5: 0,
        param6: 0,
        param7: 0,
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

    const startPoint: Feature<Point> = completedPoints.features[0]

    sendMavlinkMessage(Object.assign(new SetHomePosition(GCS_SYSTEM_ID, GCS_COMP_ID), {
        target_system: MAV_SYSTEM_ID,
        latitude: startPoint.geometry.coordinates[0] * 1e7,
        longitude: startPoint.geometry.coordinates[1] * 1e7,
        altitude: 10,
        x: 0,
        y: 0,
        z: 0,
        q: 0,
        approach_x: 0,
        approach_y: 0,
        approach_z: 0,
        time_usec: Date.now(),
    }))

    const missionItemList: MissionItemInt[] = []
    const missionItemCount = completedPoints.features.length + 3
    console.log('COUNT', missionItemCount)

    let waypointCounter = 0

    for (let i = 0; i < missionItemCount; i++) {
        let missionItem: MissionItemInt

        if (i === 0) {
            missionItem = createTakeOffCommand(i, startPoint.geometry.coordinates[1], startPoint.geometry.coordinates[0], flightParameters.elevation ?? 0)
        } else if (i === 1) {
            missionItem = createTakeOffCommand(i, startPoint.geometry.coordinates[1], startPoint.geometry.coordinates[0], flightParameters.elevation ?? 0)
        //     missionItem = createDoChangeSpeedCommand(i, flightParameters.velocity ?? 0)
        } else if (i === missionItemCount - 1) {
            const lastPoint: Feature<Point> = completedPoints.features[waypointCounter-1]
            missionItem = createLandCommand(i, lastPoint.geometry.coordinates[1], lastPoint.geometry.coordinates[0])
        } else {
            const currentPoint: Feature<Point> = completedPoints.features[waypointCounter++]
            missionItem = createWaypointCommand(i, flightParameters.acceptanceRadius ?? 10, currentPoint.geometry.coordinates[1], currentPoint.geometry.coordinates[0], flightParameters.elevation + (currentPoint.properties?.relativeElevation ?? 0))
        }
        missionItemList.push(missionItem)
    }

    console.log("MI LIST",missionItemList)

    const missionCount = Object.assign(new MissionCount(GCS_SYSTEM_ID, GCS_COMP_ID), {
        target_system: MAV_SYSTEM_ID,
        target_component: MAV_COMP_ID,
        count: missionItemList.length,
        mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
    })
    sendMavlinkMessage(missionCount)

    function missionRequestListener(missionRequest: MissionRequest) {
        console.log(`REQUESTED SEQ ${missionRequest.seq} ::: SENDING`, missionItemList[missionRequest.seq])
        sendMavlinkMessage(missionItemList[missionRequest.seq])
    }

    function missionRequestIntListener(missionRequestInt: MissionRequestInt) {
        sendMavlinkMessage(missionItemList[missionRequestInt.seq])
    }

    function missionAckListener(missionAck: MissionAck) {
        if (missionAck.type === MavMissionResult.MAV_MISSION_ACCEPTED) {
            emitter.emit('status_text', 'Mission uploaded successfully.')
        } else {
            emitter.emit('status_text', `Mission not accepted. MavMissionResult: ${missionAck.type}`)
        }

        setTimeout(() => mavLink.removeListener('MISSION_REQUEST', missionRequestListener), 100)
        setTimeout(() => mavLink.removeListener('MISSION_REQUEST_INT', missionRequestIntListener), 100)
        setTimeout(() => mavLink.removeListener('MISSION_ACK', missionAckListener), 200)
    }

    mavLink.on('MISSION_REQUEST', missionRequestListener)
    mavLink.on('MISSION_REQUEST_INT', missionRequestIntListener)
    mavLink.on('MISSION_ACK', missionAckListener)
}

function downloadMission() {
    emitter.emit('status_text', 'Downloading mission.')
    sendMavlinkMessage(Object.assign(new MissionRequestList(GCS_SYSTEM_ID, GCS_COMP_ID), {
        target_system: MAV_SYSTEM_ID,
        target_component: MAV_COMP_ID,
        mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
    }))

    let count = 0
    const missionItemList: MissionItemInt[] = []

    function missionCountListener(missionCount: MissionCount) {
        count = missionCount.count

        sendMavlinkMessage(Object.assign(new MissionRequestInt(GCS_SYSTEM_ID, GCS_COMP_ID), {
            target_system: MAV_SYSTEM_ID,
            target_component: MAV_COMP_ID,
            seq: 0,
            mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
        }))
    }

    function missionItemIntListener(missionItemInt: MissionItemInt) {
        missionItemList.push(missionItemInt)
        if (missionItemInt.seq < count-1) {
            sendMavlinkMessage(Object.assign(new MissionRequestInt(GCS_SYSTEM_ID, GCS_COMP_ID), {
                target_system: MAV_SYSTEM_ID,
                target_component: MAV_COMP_ID,
                seq: missionItemInt.seq + 1,
                mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
            }))
        } else {
            console.log("RESULT", missionItemList)
            emitter.emit('status_text', 'Mission items downloaded: ' + missionItemList.length)
            sendMavlinkMessage(Object.assign(new MissionAck(GCS_SYSTEM_ID, GCS_COMP_ID), {
                target_system: MAV_SYSTEM_ID,
                target_component: MAV_COMP_ID,
                type: 0,
                mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
            }))
            stopListeners()
        }
    }

    function stopListeners() {
        setTimeout(() => mavLink.removeListener('MISSION_ITEM_INT', missionItemIntListener), 100)
    }

    mavLink.once('MISSION_COUNT', missionCountListener)
    mavLink.on('MISSION_ITEM_INT', missionItemIntListener)

    setTimeout(() => stopListeners(), 5000)
}

function clearMission() {
    emitter.emit('status_text', 'Clearing mission.')
    sendMavlinkMessage(Object.assign(new MissionClearAll(GCS_SYSTEM_ID, GCS_COMP_ID), {
        target_system: MAV_SYSTEM_ID,
        target_component: MAV_COMP_ID,
        mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
    }))

    function missionAckListener(missionAck: MissionAck) {
        if (missionAck.type === MavMissionResult.MAV_MISSION_ACCEPTED) {
            emitter.emit('status_text', 'Mission cleared.')
        } else {
            emitter.emit('status_text', 'Clearing failed with code ' + missionAck.type)
        }
    }

    function stopListeners() {
        setTimeout(() => mavLink.removeListener('MISSION_ACK', missionAckListener), 100)
    }

    mavLink.on("MISSION_ACK", missionAckListener)

    setTimeout(() => stopListeners(), 5000)
}

function startMission() {
    emitter.emit('status_text', 'Starting mission...')
    sendMavlinkMessage(Object.assign(new CommandLong(GCS_SYSTEM_ID, GCS_COMP_ID), {
        target_system: MAV_SYSTEM_ID,
        target_component: MAV_COMP_ID,
        command: MavCmd.MAV_CMD_MISSION_START,
        confirmation: 0,
        param1: 0,
        param2: 0,
        param3: 0,
        param4: 0,
        param5: 0,
        param6: 0,
        param7: 0,
    }))
}

const mav = {
    emitter,
    messageCounts,
    startConnection,
    closeConnection,
    sendMavlinkMessage,
    armDrone,
    setDroneVelocity,
    uploadMission,
    downloadMission,
    clearMission,
    startMission,
}

export default mav;
