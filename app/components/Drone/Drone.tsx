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
    useTheme
} from "@material-ui/core";
import mav from '../../api/mav-connection'
import {useDispatch, useSelector} from "react-redux";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {selectDroneStatus, setDroneStatus} from '@slices/droneStatusSlice'
import {addStatusText, selectStatusTexts} from '@slices/statusTextsSlice'
import {selectCompletedPoints} from '@slices/completedPointsSlice'
import {selectFlightParameters} from '@slices/flightParametersSlice'

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
        mav.emitter.on('status_text', text => dispatch(addStatusText(text)))
        mav.emitter.on('status_data', data => {
            if (!Object.keys(data).every(k => data[k] === (droneStatus as any)[k])) {
                dispatch(setDroneStatus(data))
            }
        })
        mav.emitter.on('connecting', setConnecting)

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
                    style={{width: '6rem'}}
                    label={'Port'}
                    value={mavPort}
                    onChange={e => setMavPort(+e.target.value)}
                    variant={"outlined"}
                    size={"small"}
                    type={'number'}
                />
            </div>
            <div>
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
                <Button
                    variant={"contained"}
                    color={"primary"}
                    onClick={() => {
                        setConnecting(true)
                        dispatch(addStatusText(`Trying to connect to 192.168.1.51:${14550}...`))
                        mav.startConnection('192.168.1.51', 14550)
                    }}
                    disabled={connecting}
                    style={{color: 'white'}}
                >
                    192.168.1.51:14550
                </Button>
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
                                        {!droneStatus.armed ? <Button onClick={() => mav.armDrone()}>Arm drone</Button> : <Button onClick={() => mav.armDrone(0)}>Disarm drone</Button>}
                                    </div>
                                </>
                            )}
                        </div>
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
                        <Button onClick={() => flightParameters.velocity && mav.setDroneVelocity(flightParameters.velocity)}>Set velocity</Button>
                        <Button onClick={() => mav.uploadMission(flightParameters, completedPoints)}>Upload mission</Button>
                        <Button onClick={() => mav.startMission()}>Start mission</Button>
                        <Button onClick={() => mav.clearMission()}>Clear mission</Button>
                        <Button onClick={() => mav.downloadMission()}>Download mission</Button>
                        <div style={{display: 'flex', justifyContent: 'flex-start', textAlign: 'left'}}>
                            <pre>Message count: {JSON.stringify(mav.messageCounts, null, 1)}</pre>
                        </div>
                    </div>
                </div>
            </Drawer>
        </>
    )
}
