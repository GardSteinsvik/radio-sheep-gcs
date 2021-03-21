import events from 'events'
import dgram from 'dgram'

import {MAVLinkMessage, MAVLinkModule} from '@gardsteinsvik/node-mavlink'
import {messageRegistry} from './message-registry'
import {GlobalPositionInt} from './messages/global-position-int'
import {Feature, FeatureCollection, Point} from 'geojson'
import {MissionCount} from './messages/mission-count'
import {MavMissionType} from './enums/mav-mission-type'
import {MavCmd} from './enums/mav-cmd'
import {MissionAck} from './messages/mission-ack'
import {MavMissionResult} from './enums/mav-mission-result'
import {FlightParameters} from './interfaces/FlightParameters'
import {CommandAck} from './messages/command-ack'
import {MavResult} from './enums/mav-result'
import {MissionCurrent} from './messages/mission-current'
import {MavComponent} from './enums/mav-component'
import {MissionItemInt} from './messages/mission-item-int'
import {MissionRequestInt} from './messages/mission-request-int'
import {Heartbeat} from './messages/heartbeat'
import {MavType} from './enums/mav-type'
import {MavAutopilot} from './enums/mav-autopilot'
import {
    assignSeqNumber,
    createDoChangeSpeedCommand,
    createLandCommand,
    createTakeOffCommand,
    createWaypointCommand,
} from './missionItemFactory'
import {MissionRequestList} from './messages/mission-request-list'
import {MissionClearAll} from './messages/mission-clear-all'
import {BatteryStatus} from './messages/battery-status'
import {SheepRttAck} from './messages/sheep-rtt-ack'
import {SheepRttData} from './messages/sheep-rtt-data'
import {Data16} from './messages/data16'
import {Data32} from './messages/data32'
import {Statustext} from './messages/statustext'
import {MavModeFlag} from './enums/mav-mode-flag'
import {ParamValue} from './messages/param-value'
import {GcsValues} from './gcs-values'
import {createArmCommand, createMissionStartCommand, createRequestProtocolVersionCommand} from './commandFactory'
import {EmitterChannels} from './emitter-channels'

enum MavLinkVersion {
    MAVLink1 = 254,
    MAVLink2 = 253,
}

let MAV_SYSTEM_ID = 1
const MAV_COMP_ID = MavComponent.MAV_COMP_ID_AUTOPILOT1

const emitter = new events.EventEmitter()
setTimeout(() => emitter.emit(EmitterChannels.STATUS_TEXT, 'Connection ready.'), 0)

let socket = dgram.createSocket('udp4')

let socketAddress = 'localhost'
let socketSourcePort = 14550
let socketDestinationPort = 14550

const mavLink = new MAVLinkModule(messageRegistry, GcsValues.SYSTEM_ID, true)
let currentMavLinkVersion = MavLinkVersion.MAVLink1

let droneArmed = false

const messageCounts: any = {}

function sendUdp(buffer: Buffer) {
    socket.send(buffer, socketDestinationPort, socketAddress, (err) => {
        if (err) {
            console.error('Failed to send message.', err)
        }
    })
}

let missingHeartbeatCount = 0
let heartbeatInterval: NodeJS.Timeout
function breatheInBreatheOut() {
    // Check received heartbeats
    if (missingHeartbeatCount === 0) {
        emitter.emit(EmitterChannels.STATUS_DATA, {connected: true})
    } else if (missingHeartbeatCount === 5) {
        emitter.emit(EmitterChannels.STATUS_DATA, {connected: false})
    }
    missingHeartbeatCount++

    // Send heartbeat
    const heartbeat = Object.assign(new Heartbeat(GcsValues.SYSTEM_ID, GcsValues.COMPONENT_ID), {
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
    socket.close()
    socketAddress = address
    socketSourcePort = sourcePort
    socket = dgram.createSocket('udp4')

    socket.on('listening', () => {
        const {address, port} = socket.address();

        emitter.emit(EmitterChannels.STATUS_TEXT, 'Connected via udp:' + address + ':' + port)
        emitter.emit(EmitterChannels.CONNECTING, false)

        heartbeatInterval = setInterval(breatheInBreatheOut, GcsValues.HEARTBEAT_FREQUENCY)
    })

    socket.on('error', err => emitter.emit(EmitterChannels.STATUS_TEXT, err.message))

    socket.on('close', () => {
        emitter.emit(EmitterChannels.STATUS_TEXT, 'Connection closed.')
        emitter.emit(EmitterChannels.STATUS_DATA, {connected: false})
        emitter.emit(EmitterChannels.CONNECTING, false)
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
        console.error('MAVLink parser/packer error:', e);
    })

    mavLink.once('HEARTBEAT', (heartbeat: Heartbeat) => {
        emitter.emit(EmitterChannels.STATUS_TEXT, `First heartbeat received. Setting target system id to ${heartbeat._system_id}.`)
        MAV_SYSTEM_ID = heartbeat._system_id
        sendMavlinkMessage(createRequestProtocolVersionCommand(MAV_SYSTEM_ID, MAV_COMP_ID))
    })

    mavLink.on('HEARTBEAT', (heartbeat: Heartbeat) => {
        missingHeartbeatCount = 0
        droneArmed = !!(heartbeat.base_mode & MavModeFlag.MAV_MODE_FLAG_SAFETY_ARMED)
        emitter.emit(EmitterChannels.STATUS_DATA, {systemStatus: heartbeat.system_status, armed: droneArmed})
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
            'SHEEP_RTT_DATA',
            'FENCE_STATUS',
            'GPS_GLOBAL_ORIGIN',
        ]

        // event listener for all messages
        if (!excludedMessages.includes(message._message_name)) {
            console.log('%c[MAV] %c' + message._message_name + ': ', 'color: orange', '', [message])
        }
    })

    mavLink.on('STATUSTEXT', (statustext: Statustext) => {
        emitter.emit(EmitterChannels.STATUS_TEXT, `[MAV] ${statustext.text}`)
    })

    mavLink.on('GLOBAL_POSITION_INT', (globalPositionInt: GlobalPositionInt) => {
        emitter.emit(EmitterChannels.STATUS_DATA, {
            longitude: globalPositionInt.lon / 1e7,
            latitude: globalPositionInt.lat / 1e7,
            altitude: globalPositionInt.alt / 1e3,
            yaw: globalPositionInt.hdg / 1e2,
            vx: globalPositionInt.vx / 1e2,
            vy: globalPositionInt.vy / 1e2,
            vz: globalPositionInt.vz / 1e2,
        })
    })

    mavLink.on('BATTERY_STATUS', (batteryStatus: BatteryStatus) => {
        emitter.emit(EmitterChannels.STATUS_DATA, {battery: batteryStatus.battery_remaining})
    })

    mavLink.on('MISSION_CURRENT', (missionCurrent: MissionCurrent) => {
        emitter.emit(EmitterChannels.STATUS_DATA, {currentMissionItem: missionCurrent.seq})
    })

    mavLink.on('COMMAND_ACK', (commandAck: CommandAck) => {
        switch (commandAck.command) {
            case MavCmd.MAV_CMD_REQUEST_PROTOCOL_VERSION: {
                // mavLink.upgradeLink()
                break
            }
            case MavCmd.MAV_CMD_COMPONENT_ARM_DISARM: {
                if (commandAck.result !== MavResult.MAV_RESULT_ACCEPTED) {
                    emitter.emit(EmitterChannels.STATUS_TEXT, 'Arming/disarming failed.')
                }
                break
            }
            case MavCmd.MAV_CMD_MISSION_START: {
                if (commandAck.result === MavResult.MAV_RESULT_ACCEPTED) {
                    emitter.emit(EmitterChannels.STATUS_TEXT, 'Mission starting :)')
                } else {
                    emitter.emit(EmitterChannels.STATUS_TEXT, 'Mission did not start :(')
                }
            }
        }
    })

    mavLink.on('DATA32', async (data32: Data32) => {
        if (data32.type !== 129 || droneArmed) {
            return
        }

        const parsedMessages: MAVLinkMessage[] = await mavLink.parse(Buffer.from(data32.data))

        const sheepRttData: SheepRttData = parsedMessages.pop() as SheepRttData

        if (!sheepRttData) return

        emitter.emit(EmitterChannels.SHEEP_DATA, sheepRttData)

        const sheepRttAckBuffer: Buffer = mavLink.pack([Object.assign(new SheepRttAck(GcsValues.SYSTEM_ID, GcsValues.COMPONENT_ID), {seq: sheepRttData.seq})])

        sendMavlinkMessage(Object.assign(new Data16(GcsValues.SYSTEM_ID, GcsValues.COMPONENT_ID), {
            type: 130,
            len: sheepRttAckBuffer.length,
            data: sheepRttAckBuffer,
        }))
    })

    mavLink.on('PARAM_VALUE', (paramValue: ParamValue) => console.log(paramValue.param_id, [paramValue]))
}

function closeConnection() {
    socket.close()
}

function sendMavlinkMessage(message: MAVLinkMessage) {
    sendMavlinkMessages([message])
}

function sendMavlinkMessages(messages: MAVLinkMessage[]) {
    const buffer = mavLink.pack(messages)
    sendUdp(buffer)
    console.log('%c[GCS] %c' + messages.map(message => message._message_name).join(', ') + ': ', 'color: teal', '', messages)
}

function armDrone() {
    emitter.emit(EmitterChannels.STATUS_TEXT, 'Arming drone.')
    sendMavlinkMessage(createArmCommand(MAV_SYSTEM_ID, MAV_COMP_ID))
}

function uploadMission(flightParameters: FlightParameters, completedPoints: FeatureCollection<Point>) {
    emitter.emit(EmitterChannels.STATUS_TEXT, 'Uploading mission.')

    const startPoint: Feature<Point> = completedPoints.features[0]
    const stopPoint: Feature<Point> = completedPoints.features[completedPoints.features.length-1]

    const missionItemIntList: MissionItemInt[] = [
        createWaypointCommand(0, startPoint.geometry.coordinates[1], startPoint.geometry.coordinates[0], 0), // Dummy waypoint that is ignored by ArduPilot
        createDoChangeSpeedCommand(flightParameters.velocity ?? 5),
        createTakeOffCommand(startPoint.geometry.coordinates[1], startPoint.geometry.coordinates[0], flightParameters.elevation ?? 0),
        ...completedPoints.features.map(point => createWaypointCommand(flightParameters.acceptanceRadius ?? 10, point.geometry.coordinates[1], point.geometry.coordinates[0], flightParameters.elevation + (point.properties?.altitude ?? 0))),
        createLandCommand(stopPoint.geometry.coordinates[1], stopPoint.geometry.coordinates[0]),
    ].map(assignSeqNumber)

    const missionCount = Object.assign(new MissionCount(GcsValues.SYSTEM_ID, GcsValues.COMPONENT_ID), {
        target_system: MAV_SYSTEM_ID,
        target_component: MAV_COMP_ID,
        count: missionItemIntList.length,
        mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
    })

    sendMavlinkMessage(missionCount)

    let abortTimeout = setTimeout(stopListeners, GcsValues.TRANSMISSION_TIMEOUT)

    function missionRequestIntListener({seq} : {seq: number}) {
        clearTimeout(abortTimeout)
        sendMavlinkMessage(missionItemIntList[seq])
        abortTimeout = setTimeout(stopListeners, GcsValues.TRANSMISSION_TIMEOUT)
    }

    function missionAckListener(missionAck: MissionAck) {
        clearTimeout(abortTimeout)
        if (missionAck.type === MavMissionResult.MAV_MISSION_ACCEPTED) {
            emitter.emit(EmitterChannels.STATUS_TEXT, 'Mission uploaded successfully.')
        } else {
            emitter.emit(EmitterChannels.STATUS_TEXT, `Mission not accepted. MavMissionResult: ${missionAck.type}`)
        }

        setTimeout(stopListeners, 100)
    }

    function stopListeners() {
        mavLink.removeListener('MISSION_REQUEST', missionRequestIntListener)
        mavLink.removeListener('MISSION_REQUEST_INT', missionRequestIntListener)
        mavLink.removeListener('MISSION_ACK', missionAckListener)
    }

    mavLink.on('MISSION_REQUEST', missionRequestIntListener)
    mavLink.on('MISSION_REQUEST_INT', missionRequestIntListener)
    mavLink.on('MISSION_ACK', missionAckListener)
}

function downloadMission() {
    emitter.emit(EmitterChannels.STATUS_TEXT, 'Downloading mission.')
    sendMavlinkMessage(Object.assign(new MissionRequestList(GcsValues.SYSTEM_ID, GcsValues.COMPONENT_ID), {
        target_system: MAV_SYSTEM_ID,
        target_component: MAV_COMP_ID,
        mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
    }))

    let abortTimeout = setTimeout(abortTransmission, GcsValues.TRANSMISSION_TIMEOUT)
    let missionItemTimeout: NodeJS.Timeout

    let retries = 0
    let currentSeq = 0
    let count = 0
    const missionItemList: MissionItemInt[] = []

    function missionCountListener(missionCount: MissionCount) {
        clearTimeout(abortTimeout)

        count = missionCount.count

        sendMavlinkMessage(Object.assign(new MissionRequestInt(GcsValues.SYSTEM_ID, GcsValues.COMPONENT_ID), {
            target_system: MAV_SYSTEM_ID,
            target_component: MAV_COMP_ID,
            seq: 0,
            mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
        }))

        abortTimeout = setTimeout(abortTransmission, GcsValues.TRANSMISSION_TIMEOUT)
    }

    function requestMissionItem() {
        clearTimeout(missionItemTimeout)

        if (retries < GcsValues.MAX_RETRIES) {
            sendMavlinkMessage(Object.assign(new MissionRequestInt(GcsValues.SYSTEM_ID, GcsValues.COMPONENT_ID), {
                target_system: MAV_SYSTEM_ID,
                target_component: MAV_COMP_ID,
                seq: currentSeq,
                mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
            }))
            missionItemTimeout = setTimeout(requestMissionItem, GcsValues.MISSION_ITEM_TIMEOUT)
        } else {
            clearTimeout(abortTimeout)
            abortTransmission()
        }

        retries++
    }

    function missionItemIntListener(missionItemInt: MissionItemInt) {
        if (missionItemInt.seq === currentSeq) {
            clearTimeout(missionItemTimeout)
            clearTimeout(abortTimeout)

            retries = 0
            missionItemList.push(missionItemInt)
            currentSeq++

            if (missionItemInt.seq < count-1) {
                requestMissionItem()
            } else {
                console.log('RESULT', missionItemList)
                emitter.emit(EmitterChannels.STATUS_TEXT, 'Mission items downloaded: ' + missionItemList.length)
                sendMavlinkMessage(Object.assign(new MissionAck(GcsValues.SYSTEM_ID, GcsValues.COMPONENT_ID), {
                    target_system: MAV_SYSTEM_ID,
                    target_component: MAV_COMP_ID,
                    type: MavMissionResult.MAV_MISSION_ACCEPTED,
                    mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
                }))
                setTimeout(stopListeners, 100)
            }
        }
    }

    function abortTransmission() {
        emitter.emit(EmitterChannels.STATUS_TEXT, 'Mission download failed.')
        sendMavlinkMessage(Object.assign(new MissionAck(GcsValues.SYSTEM_ID, GcsValues.COMPONENT_ID), {
            target_system: MAV_SYSTEM_ID,
            target_component: MAV_COMP_ID,
            type: MavMissionResult.MAV_MISSION_OPERATION_CANCELLED,
            mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
        }))
        setTimeout(stopListeners, 100)
    }

    function stopListeners() {
        mavLink.removeListener('MISSION_ITEM_INT', missionItemIntListener)
        mavLink.removeListener('MISSION_COUNT', missionCountListener)
    }

    mavLink.on('MISSION_COUNT', missionCountListener)
    mavLink.on('MISSION_ITEM_INT', missionItemIntListener)
}

function clearMission() {
    emitter.emit(EmitterChannels.STATUS_TEXT, 'Clearing mission.')
    sendMavlinkMessage(Object.assign(new MissionClearAll(GcsValues.SYSTEM_ID, GcsValues.COMPONENT_ID), {
        target_system: MAV_SYSTEM_ID,
        target_component: MAV_COMP_ID,
        mission_type: MavMissionType.MAV_MISSION_TYPE_MISSION,
    }))

    const abortTimeout = setTimeout(stopListeners, GcsValues.TRANSMISSION_TIMEOUT)

    function missionAckListener(missionAck: MissionAck) {
        clearTimeout(abortTimeout)
        if (missionAck.type === MavMissionResult.MAV_MISSION_ACCEPTED) {
            emitter.emit(EmitterChannels.STATUS_TEXT, 'Mission cleared.')
        } else {
            emitter.emit(EmitterChannels.STATUS_TEXT, 'Clearing failed with code ' + missionAck.type)
        }
        setTimeout(stopListeners, 100)
    }

    function stopListeners() {
        mavLink.removeListener('MISSION_ACK', missionAckListener)
    }

    mavLink.on('MISSION_ACK', missionAckListener)
}

function startMission() {
    emitter.emit(EmitterChannels.STATUS_TEXT, 'Starting mission...')
    sendMavlinkMessage(createMissionStartCommand(MAV_SYSTEM_ID, MAV_COMP_ID))
}

const mav = {
    emitter,
    messageCounts,
    startConnection,
    closeConnection,
    sendMavlinkMessage,
    armDrone,
    uploadMission,
    downloadMission,
    clearMission,
    startMission,
}

export default mav;
