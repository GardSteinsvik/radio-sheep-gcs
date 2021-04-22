import React, {useEffect, useState} from 'react'
import {
    Badge,
    Button,
    createStyles,
    Drawer,
    IconButton,
    LinearProgress,
    TextField,
    Typography,
    useTheme,
} from "@material-ui/core"
import mav from '../../api/mav-connection'
import {useDispatch, useSelector} from "react-redux"
import {makeStyles, Theme} from "@material-ui/core/styles"
import {selectDroneStatus, setDroneStatus} from '@slices/droneStatusSlice'
import {addStatusText, selectStatusTexts} from '@slices/statusTextsSlice'
import {selectCompletedPoints} from '@slices/completedPointsSlice'
import {selectFlightParameters} from '@slices/flightParametersSlice'
import {SheepRttData} from "@/api/messages/sheep-rtt-data"
import {addRssiData, storeSheepRttPoint} from "@slices/sheepRttPointsSlice"
import {Feature, Point} from "geojson"
import {EmitterChannels} from '@/api/emitter-channels'
import {GlobalPositionInt} from '@/api/messages/global-position-int'
import {GcsValues} from '@/api/gcs-values'

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
        height: '100%',
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        color: 'white',
        flexGrow: 1,
    },
    drawerContent: {
        height: '100%',
        minWidth: '28rem',
    },
}))

const CONNECTIONS = [
    {label: 'SITL', address: '192.168.38.2', port: 14550},
    {label: 'DRONE', address: '192.168.4.1', port: 14550},
]

export default function Drone() {
    const theme = useTheme()
    const classes = useStyles(theme)
    const dispatch = useDispatch()

    const [mavAddress, setMavAddress] = useState('192.168.38.2')
    const [mavPort, setMavPort] = useState(5760)
    const [connecting, setConnecting] = useState(false)

    const statusTexts = useSelector(selectStatusTexts)
    const droneStatus = useSelector(selectDroneStatus)
    const completedPoints = useSelector(selectCompletedPoints)
    const flightParameters = useSelector(selectFlightParameters)

    const [drawerOpen, setDrawerOpen] = useState(false)
    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
            return;
        }
        setDrawerOpen(open)
    };

    useEffect(() => {
        mav.emitter.on(EmitterChannels.STATUS_TEXT, text => dispatch(addStatusText(text)))
        mav.emitter.on(EmitterChannels.STATUS_DATA, data => {
            if (!Object.keys(data).every(k => data[k] === (droneStatus as any)[k])) {
                dispatch(setDroneStatus(data))
            }
        })
        mav.emitter.on(EmitterChannels.CONNECTING, setConnecting)

        mav.emitter.on(EmitterChannels.SHEEP_DATA, (sheepRttData: SheepRttData) => {
            const sheepRttFeature: Feature<Point> = {
                type: "Feature",
                id: sheepRttData.seq,
                properties: {
                    alt: sheepRttData.alt / 1e3,
                    tid: sheepRttData.tid,
                    dis: sheepRttData.dis * 5,
                },
                geometry: {
                    type: "Point",
                    coordinates: [sheepRttData.lon / 1e7, sheepRttData.lat/ 1e7]
                }
            }

            dispatch(storeSheepRttPoint(sheepRttFeature))
        })

        mav.emitter.on(EmitterChannels.RSSI_DATA, (sheepRttData: SheepRttData) => {
            dispatch(addRssiData([sheepRttData.seq-1, sheepRttData.dis >= 128 ? sheepRttData.dis - 256 : sheepRttData.dis]))
        })

        return () => {
            mav.emitter.removeAllListeners()
        }
    }, [droneStatus])

    const startConnectionSection = (
        <div style={{display: 'flex', flexDirection: "column", alignItems: "flex-start", marginBottom: '2rem'}}>
            <div style={{marginBottom: '1rem'}}>
                <TextField
                    style={{width: '10rem', marginRight: '1rem'}}
                    label={'IP address'}
                    value={mavAddress}
                    onChange={e => setMavAddress(e.target.value)}
                    variant={"outlined"}
                    size={"small"}
                    type={'text'}
                />
                <TextField
                    style={{width: '6rem', marginRight: '1rem'}}
                    label={'Port'}
                    value={mavPort}
                    onChange={e => setMavPort(+e.target.value)}
                    variant={"outlined"}
                    size={"small"}
                    type={'number'}
                />
                <Button
                    variant={"contained"}
                    color={"primary"}
                    onClick={() => {
                        setConnecting(true)
                        dispatch(addStatusText(`Trying to connect to ${mavAddress}:${mavPort}...`))
                        mav.startConnection(mavAddress, mavPort)
                    }}
                    disabled={connecting}
                    style={{color: 'white'}}
                >
                    Connect
                </Button>
            </div>
            <div style={{display: 'flex', flexDirection: "column"}}>
                {CONNECTIONS.map(c => (
                    <Button
                        key={c.label}
                        variant={"contained"}
                        color={"primary"}
                        onClick={() => {
                            setConnecting(true)
                            dispatch(addStatusText(`Trying to connect to ${c.address}:${c.port}..`))
                            mav.startConnection(c.address, c.port)
                        }}
                        disabled={connecting}
                        style={{color: 'white', marginTop: 8}}
                    >
                        {`${c.label} (${c.address}:${c.port})`}
                    </Button>
                ))}
            </div>
        </div>
    )

    return (
        <>
            <Badge color={droneStatus.connected ? 'secondary' : 'error'} overlap={"circle"} badgeContent={' '} variant={"dot"}>
                <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
                    <i className="fa fa-helicopter"/>
                </IconButton>
            </Badge>
            <Drawer open={drawerOpen} anchor={"right"} onClose={toggleDrawer(false)}>
                <div className={classes.drawerContent}>
                    <div style={{padding: '2rem'}}>
                        <Typography variant={"h5"} component={"h2"}>Drone connection</Typography>
                        <div style={{height: '12rem', marginTop: '2rem'}}>
                            {!droneStatus.connected ? (
                                <>
                                    {startConnectionSection}
                                    {connecting && <LinearProgress/>}
                                </>
                            ) : (
                                <>
                                    <Button variant={"contained"} color={"inherit"} onClick={() => mav.closeConnection()}>Disconnect</Button>
                                    <div>
                                        <Button onClick={() => mav.armDrone()} disabled={droneStatus.armed}>Arm drone</Button>
                                    </div>
                                </>
                            )}
                        </div>
                        <Button onClick={() => mav.uploadMission(flightParameters, completedPoints)}>Upload mission</Button>
                        <Button onClick={() => mav.startMission()}>Start mission</Button>
                        <Button onClick={() => mav.clearMission()}>Clear mission</Button>
                        <Button onClick={() => mav.downloadMission()}>Download mission</Button>
                        <Button onClick={() => mav.setParameter('SIM_SPEEDUP', 1)}>Set param</Button>
                        <Button disabled={!completedPoints.features[0]} onClick={() => mav.sendMavlinkMessage(Object.assign(new GlobalPositionInt(GcsValues.SYSTEM_ID, GcsValues.COMPONENT_ID), {
                            time_boot_ms: 1000,
                            lat: completedPoints.features[0]?.geometry.coordinates[1],
                            lon: completedPoints.features[0]?.geometry.coordinates[0],
                            alt: 10,
                            relative_alt: 1,
                            vx: 0.01,
                            vy: 0.01,
                            vz: 0.01,
                            hdg: 1,
                        }))}>Send GPS</Button>
                        <div>
                            <div><strong>Status: </strong></div>
                            <textarea style={{width: '100%', height: '28rem', fontFamily: '"Courier New", Courier, monospace', color: 'white', backgroundColor: '#333', resize: 'none'}}
                                      value={statusTexts.join('\n')}
                                      onChange={() => {}}
                            />
                            <div style={{display: 'flex', justifyContent: 'flex-start', textAlign: 'left'}}>
                                <pre>Drone data: {JSON.stringify(droneStatus, null, 1)}</pre>
                            </div>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'flex-start', textAlign: 'left'}}>
                            <pre>Heartbeats: {JSON.stringify(mav.lastHeartbeats, null, 1)}</pre>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'flex-start', textAlign: 'left'}}>
                            <pre>Message counts: {JSON.stringify(mav.messageCounts, null, 1)}</pre>
                        </div>
                    </div>
                </div>
            </Drawer>
        </>
    )
}
