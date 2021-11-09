import React from 'react'
import {makeStyles} from "@material-ui/core/styles"
import {Button, Paper, Slider, Switch, Typography} from '@material-ui/core'
import {MapParameters} from "@interfaces/MapParameters"
import {useDispatch, useSelector} from "react-redux"
import {selectMapParameters, setMapParameters} from "@slices/mapParametersSlice"
import {selectSelectedSheepRttPoint, setSelectedSheepRttPoint} from "@slices/selectedSheepRttPointSlice"
import {FeatureCollection, Point} from "geojson"
import {removeSheepRttPoints, selectSheepRttPoints} from "@slices/sheepRttPointsSlice"
import SheepUpload from "@/components/SheepUpload/SheepUpload"
import SheepPointsEstimation from "@/components/SheepPointsEstimation/SheepPointsEstimation"
import SheepPointSaveLoad from '@/components/MapControl/SheepPointSaveLoad'

const useStyles = makeStyles({
    paper: {
        display: 'flex',
        padding: '1rem',
    },
    formSection: {
        padding: '0 1rem',
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
    const sheepRttPoints: FeatureCollection<Point> = useSelector(selectSheepRttPoints)
    const selectedSheepRttPoint: number = useSelector(selectSelectedSheepRttPoint)

    const sheepIdList: number[] = [...new Set(sheepRttPoints.features.map(point => +(point.properties?.tid ?? 0)))]

    return (
        <Paper className={classes.paper} variant={"outlined"}>
            <div className={classes.formSection}>
                <Typography id="gray-tone-switch" gutterBottom>
                    Gray tone map
                </Typography>
                <Switch
                    aria-labelledby={'gray-tone-switch'}
                    color={"primary"}
                    checked={mapParameters.grayTone}
                    onChange={(_, checked) => dispatch(setMapParameters(Object.assign({}, mapParameters, {grayTone: checked})))}
                />
            </div>
            {sheepRttPoints.features.length > 0 && (
                <div className={classes.formSection}>
                    <Typography id="selected-sheep-rtt-point-slider" gutterBottom>
                        Selected sheep id: {selectedSheepRttPoint}
                    </Typography>
                    <Slider
                        aria-labelledby={'selected-sheep-rtt-point-slider'}
                        className={classes.slider}
                        value={selectedSheepRttPoint}
                        onChange={(_, value) => dispatch(setSelectedSheepRttPoint(+value))}
                        step={null}
                        min={Math.min(...sheepIdList)}
                        max={Math.max(...sheepIdList)}
                        marks={sheepIdList.map(id => ({value: id, label: ''}))}
                    />
                    <Typography gutterBottom>Number of samples: {sheepRttPoints.features.filter(f => f.properties?.tid === selectedSheepRttPoint).length}/{sheepRttPoints.features.length}</Typography>
                </div>
            )}
            <div className={classes.formSection}>
                <Typography gutterBottom>
                    Paste GeoJSON
                </Typography>
                <SheepUpload/>
            </div>
            <div className={classes.formSection}>
                <Typography gutterBottom>
                    Estimate sheep points
                </Typography>
                <SheepPointsEstimation/>
            </div>
            <div className={classes.formSection}>
                <Button onClick={() => confirm('Are you sure you want to remove the sheep data?') && dispatch(removeSheepRttPoints())}>Clear sheep RTT data</Button>
                <SheepPointSaveLoad />
            </div>
        </Paper>
    )
}
