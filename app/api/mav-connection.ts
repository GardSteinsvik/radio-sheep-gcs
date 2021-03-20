import events from 'events'
import dgram from 'dgram'

import {MAVLinkMessage, MAVLinkModule} from '@gardsteinsvik/node-mavlink';
import {messageRegistry} from './message-registry';
import {RequestDataStream} from "./messages/request-data-stream";
import {MavDataStream} from "./enums/mav-data-stream";
import {GlobalPositionInt} from "./messages/global-position-int";
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
import {createLandCommand, createTakeOffCommand, createWaypointCommand} from "./missionItemFactory";
import {MissionRequest} from "./messages/mission-request";
import {MissionRequestList} from "./messages/mission-request-list";
import {MissionClearAll} from "./messages/mission-clear-all";
import {BatteryStatus} from "./messages/battery-status";
import {SheepRttAck} from "./messages/sheep-rtt-ack";
import {SheepRttData} from "./messages/sheep-rtt-data";
import {Data16} from "./messages/data16";
import {Data32} from "./messages/data32";
import {Statustext} from "./messages/statustext";

enum MavLinkVersion {
    MAVLink1 = 254,
    MAVLink2 = 253,
}

const GCS_SYSTEM_ID = 255
const GCS_COMP_ID = MavComponent.MAV_COMP_ID_MISSIONPLANNER
let MAV_SYSTEM_ID = 1
const MAV_COMP_ID = MavComponent.MAV_COMP_ID_AUTOPILOT1

const emitter = new events.EventEmitter()
setTimeout(() => emitter.emit("status_text", "Connection ready."), 0)

let socket = dgram.createSocket("udp4")

let socketAddress = 'localhost'
let socketSourcePort = 14550
let socketDestinationPort = 14550

const mavLink = new MAVLinkModule(messageRegistry, GCS_SYSTEM_ID, true)
let currentMavLinkVersion = MavLinkVersion.MAVLink1

const sentMessages: MAVLinkMessage[] = []
const messageCounts: any = {}

function sendUdp(buffer: Buffer) {
    socket.send(buffer, socketDestinationPort, socketAddress, (err) => {
        if (err) {
            console.error("Failed to send message.", err)
        }
    })
}

let missingHeartbeatCount = 0
const HEARTBEAT_INTERVAL = 1 // Hz
let heartbeatInterval: NodeJS.Timeout
function breatheInBreatheOut() {
    // Check received heartbeats
    if (missingHeartbeatCount === 0) {
        emitter.emit('status_data', {connected: true})
    } else if (missingHeartbeatCount === 5) {
        emitter.emit('status_data', {connected: false})
    }
    missingHeartbeatCount++

    // Send heartbeat
    const heartbeat = Object.assign(new Heartbeat(GCS_SYSTEM_ID, GCS_COMP_ID), {
        type: MavType.MAV_TYPE_GCS,
        autopilot: MavAutopilot.MAV_AUTOPILOT_INVALID,
        base_mode: 0, // Unknown value for GCS
        custom_mode: 0,
        system_status: 0, // Unknown value for GCS
        mavlink_version: 3,
    })
    const buffer = mavLink.pack([heartbeat])
    sendUdp(buffer)
}



function startConnection(address: string, sourcePort: number) {
    socketAddress = address
    socketSourcePort = sourcePort
    socket = dgram.createSocket("udp4")

    socket.on('listening', () => {
        const address = socket.address();

        emitter.emit('status_text', 'Connected via udp:' + address.address + ':' + address.port)
        emitter.emit('connecting', false)

        heartbeatInterval = setInterval(breatheInBreatheOut, HEARTBEAT_INTERVAL * 1000)
        // setTimeout(() => startDataStreams(2, 2, 2, 0, 3, 10, 10, 10), 1000)
    })

    socket.on("error", err => emitter.emit('status_text', err.message))
    socket.on("close", () => {
        emitter.emit('status_text', 'Connection closed.')
        emitter.emit('status_data', {connected: false})
        emitter.emit('connecting', false)
        clearInterval(heartbeatInterval)
        mavLink.removeAllListeners()
    })

    socket.on('message', async (data, rinfo) => {
        socketDestinationPort = rinfo.port
        const mavLinkVersion = data[0]
        if (mavLinkVersion === currentMavLinkVersion) {
            await mavLink.parse(Buffer.from(data))
        } else {
            switch (mavLinkVersion) {
                case MavLinkVersion.MAVLink1:
                    mavLink.downgradeLink()
                    break
                case MavLinkVersion.MAVLink2:
                    mavLink.upgradeLink()
                    break
            }
            currentMavLinkVersion = mavLinkVersion
        }
    })

    socket.bind(socketSourcePort)

    mavLink.on('error', function (e: Error) {
        // event listener for node-mavlink ALL error message
        console.error("MAVLINK ON ERROR", e);
    })

    mavLink.once('HEARTBEAT', (heartbeat: Heartbeat) => {
        emitter.emit('status_text', `First heartbeat received. Setting target system id to ${heartbeat._system_id}.`)
        MAV_SYSTEM_ID = heartbeat._system_id
        sendMavlinkMessage(Object.assign(new CommandLong(GCS_SYSTEM_ID, GCS_COMP_ID), {
            target_system: MAV_SYSTEM_ID,
            target_component: MAV_COMP_ID,
            command: MavCmd.MAV_CMD_REQUEST_PROTOCOL_VERSION,
            confirmation: 0,
            param1: 1,
            param2: 0,
            param3: 0,
            param4: 0,
            param5: 0,
            param6: 0,
            param7: 0,
        }))
    })

    mavLink.on('HEARTBEAT', (heartbeat: Heartbeat) => {
        missingHeartbeatCount = 0
        emitter.emit('status_data', {systemStatus: heartbeat.system_status, baseMode: heartbeat.base_mode})
    })

    mavLink.on('message', (message: MAVLinkMessage) => {
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
            'STATUSTEXT',
            'LOCAL_POSITION_NED',
            // 'COMMAND_ACK',
            'MEMINFO',
            'VIBRATION',
            'WSTATUS',
            'SYSTEM_TIME',
            'PARAM_VALUE',
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
            'SENSOR_OFFSETS',
            'POSITION_TARGET_GLOBAL_INT',
            'MISSION_ITEM_REACHED',
            'DATA32',
            // 'SHEEP_RTT_DATA',
            'FENCE_STATUS',
        ]

        // event listener for all messages
        if (!excludedMessages.includes(message._message_name)) {
            console.log('%c[MAV] %c' + message._message_name + ': ', 'color: orange', '', [message])
        }
    })

    mavLink.on('STATUSTEXT', (statustext: Statustext) => {
        emitter.emit('status_text', `[MAV] ${statustext.text}`)
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

    mavLink.on("BATTERY_STATUS", (batteryStatus: BatteryStatus) => {
        emitter.emit("status_data", {battery: batteryStatus.battery_remaining})
    })

    mavLink.on('MISSION_CURRENT', (missionCurrent: MissionCurrent) => {
        emitter.emit('status_data', {currentMissionItem: missionCurrent.seq})
    })

    mavLink.on('COMMAND_ACK', (commandAck: CommandAck) => {
        const lastRelevantCommand = sentMessages.find(mavLinkMessage => mavLinkMessage.command === commandAck.command) as CommandLong
        switch (commandAck.command) {
            case MavCmd.MAV_CMD_REQUEST_PROTOCOL_VERSION: {
                // mavLink.upgradeLink()
                break
            }
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

    mavLink.on('DATA32', async (data32: Data32) => {
        if (data32.type !== 129) {
            return
        }

        const parsedMessages: MAVLinkMessage[] = await mavLink.parse(Buffer.from(data32.data))

        const sheepRttData: SheepRttData = parsedMessages.pop() as SheepRttData

        if (!sheepRttData) return

        emitter.emit('sheep_data', sheepRttData)

        const sheepRttAckBuffer: Buffer = mavLink.pack([Object.assign(new SheepRttAck(GCS_SYSTEM_ID, GCS_COMP_ID), {seq: sheepRttData.seq})])

        sendMavlinkMessage(Object.assign(new Data16(GCS_SYSTEM_ID, GCS_COMP_ID), {
            type: 130,
            len: sheepRttAckBuffer.length,
            data: sheepRttAckBuffer,
        }))
    })
}

function closeConnection() {
    // socket.emit("close")
    socket.close()
}

function sendMavlinkMessage(message: MAVLinkMessage) {
    sendMavlinkMessages([message])
}

function sendMavlinkMessages(messages: MAVLinkMessage[]) {
    const buffer = mavLink.pack(messages)
    sendUdp(buffer)
    console.log('%c[GCS] %c' + messages.map(message => message._message_name).join(', ') + ': ', 'color: teal', '', messages)
    sentMessages.unshift(...messages)
}

function startDataStreams(rawSensorsRate: number, extendedStatusRate: number, rcChannelsRate: number, rawControllerRate: number, positionRate: number, extra1Rate: number, extra2Rate: number, extra3Rate: number) {
    emitter.emit('status_text', 'Starting data streams.')
    const createDataStreamMessage = (id: number, rate: number) => Object.assign(new RequestDataStream(GCS_SYSTEM_ID, GCS_COMP_ID), {target_system: MAV_SYSTEM_ID, target_component: MAV_COMP_ID, req_stream_id: id, req_message_rate: rate, start_stop: 1})
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
    const stopPoint: Feature<Point> = completedPoints.features[completedPoints.features.length-1]


    const missionItemIntList: MissionItemInt[] = [
        createWaypointCommand(0, 0, startPoint.geometry.coordinates[1], startPoint.geometry.coordinates[0], 0), // Dummy waypoint that is ignored by ArduPilot
        createTakeOffCommand(0, startPoint.geometry.coordinates[1], startPoint.geometry.coordinates[0], flightParameters.elevation ?? 0),
        ...completedPoints.features.map(point => createWaypointCommand(0, flightParameters.acceptanceRadius ?? 10, point.geometry.coordinates[1], point.geometry.coordinates[0], flightParameters.elevation + (point.properties?.altitude ?? 0))),
        createLandCommand(0, stopPoint.geometry.coordinates[1], stopPoint.geometry.coordinates[0]),
    ].map((missionItemInt: MissionItemInt, index: number) => Object.assign(missionItemInt, {seq: index}))

    const missionCount = Object.assign(new MissionCount(GCS_SYSTEM_ID, GCS_COMP_ID), {
        target_system: MAV_SYSTEM_ID,
        target_component: MAV_COMP_ID,
        count: missionItemIntList.length,
        mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
    })
    sendMavlinkMessage(missionCount)

    function missionRequestListener(missionRequest: MissionRequest) {
        sendMavlinkMessage(missionItemIntList[missionRequest.seq])
    }

    function missionRequestIntListener(missionRequestInt: MissionRequestInt) {
        sendMavlinkMessage(missionItemIntList[missionRequestInt.seq])
    }

    function missionAckListener(missionAck: MissionAck) {
        if (missionAck.type === MavMissionResult.MAV_MISSION_ACCEPTED) {
            emitter.emit('status_text', 'Mission uploaded successfully.')
        } else {
            emitter.emit('status_text', `Mission not accepted. MavMissionResult: ${missionAck.type}`)
        }

        setTimeout(() => stopListeners(), 100)
    }

    function stopListeners() {
        mavLink.removeListener('MISSION_REQUEST', missionRequestListener)
        mavLink.removeListener('MISSION_REQUEST_INT', missionRequestIntListener)
        mavLink.removeListener('MISSION_ACK', missionAckListener)
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
            setTimeout(() => stopListeners(), 100)
        }
    }

    function stopListeners() {
        mavLink.removeListener('MISSION_ITEM_INT', missionItemIntListener)
        mavLink.removeListener('MISSION_COUNT', missionCountListener)
    }

    mavLink.on('MISSION_COUNT', missionCountListener)
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
