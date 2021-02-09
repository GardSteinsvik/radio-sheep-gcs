import React from 'react'
import {makeStyles} from "@material-ui/core/styles";
import {Paper, Slider, Typography} from '@material-ui/core';
import {MapParameters} from "@interfaces/MapParameters";
import {useDispatch, useSelector} from "react-redux";
import {selectMapParameters, setMapParameters} from "@slices/mapParametersSlice";

const useStyles = makeStyles({
    paper: {
        display: 'flex',
        padding: '1rem',
    },
    formSection: {
    },
    slider: {
        width: '14rem',
        marginLeft: '1rem'
    },
})


export default function MapControl() {
    const classes = useStyles()
    const dispatch = useDispatch()

    const mapParameters: MapParameters = useSelector(selectMapParameters)

    return (
        <Paper className={classes.paper} variant={"outlined"}>
            <div className={classes.formSection}>
                <Typography id="elevation-profile-visibility-slider" gutterBottom>
                    Elevation profile visibility {mapParameters.elevationProfileVisibility}%
                </Typography>
                <Slider
                    aria-labelledby={'elevation-profile-visibility-slider'}
                    className={classes.slider}
                    value={mapParameters.elevationProfileVisibility}
                    onChange={(_, value) => dispatch(setMapParameters({elevationProfileVisibility: +value}))}
                    step={1}
                    min={0}
                    max={100}
                    marks={[0, 50, 100].map(v => ({value: v, label: v + '%'}))}
                />
            </div>
        </Paper>
    )
}
