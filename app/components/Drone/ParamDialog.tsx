import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import {useSelector} from 'react-redux'
import {
    Button,
    createStyles,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    Input,
    InputLabel,
    Select,
    Theme,
    Typography,
} from '@material-ui/core'
import {selectDroneParameters} from '@slices/droneParametersSlice'
import {DroneParameter, DroneParameters} from '@interfaces/DroneParameter'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
        },
    }),
)

const ParamSelect = (props: {component: string, droneParameter: DroneParameter, handleParamSet: Function}) => {
    const classes = useStyles()
    const [selectedParam, setSelectedParam] = useState('')
    const [selectedValue, setSelectedValue] = useState(0)

    const [systemId, componentId] = props.component.split('-').map(v => +v)

    useEffect(() => {
        setSelectedValue(props.droneParameter[selectedParam]?.value ?? 0)
    }, [selectedParam])

    return (
        <form className={classes.container}>
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="dialog-native">Param</InputLabel>
                <Select
                    native
                    value={selectedParam}
                    onChange={e => setSelectedParam(`${e.target.value}`)}
                    input={<Input id="dialog-native" />}
                >
                    <option aria-label="None" value="" />
                    {Object.keys(props.droneParameter).map(paramId => <option key={paramId} label={paramId} value={paramId} />)}
                </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="dialog-param-value">Value {selectedParam ? `(type: ${props.droneParameter[selectedParam]?.type ?? 0})` : ''}</InputLabel>
                <Input id="dialog-param-value" value={selectedValue} onChange={e => setSelectedValue(+e.target.value)}/>
            </FormControl>
            <Button disabled={!selectedParam} onClick={() => props.handleParamSet(systemId, componentId, selectedParam, selectedValue, props.droneParameter[selectedParam]?.type)}>Set param</Button>
        </form>
    )
}

const ParamDialog = (props: {handleParamSet: Function}) => {
    const droneParameters: DroneParameters = useSelector(selectDroneParameters)

    const [open, setOpen] = useState(false)

    return (
        <>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Parameters</DialogTitle>
                <DialogContent>
                    {Object.keys(droneParameters).map(component => {
                        const paramsForComponent: DroneParameter = droneParameters[component]
                        const [systemId, componentId] = component.split('-')

                        return (
                            <div key={component}>
                                <Typography variant={'h6'}>{`S${systemId}-C${componentId}`}</Typography>
                                <ParamSelect component={component} droneParameter={paramsForComponent} handleParamSet={props.handleParamSet}/>
                            </div>
                        )
                    })}
                </DialogContent>
            </Dialog>
            <Button variant={'contained'} color={'primary'} size={'small'} onClick={() => setOpen(true)}>
                Open param inspector
            </Button>
        </>
    )

}

export default ParamDialog
