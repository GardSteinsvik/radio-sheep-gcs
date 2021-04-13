import React from 'react'
import {readFile, writeFile} from 'fs'
import {format} from 'date-fns'
import {useDispatch, useSelector} from 'react-redux'
import {selectSheepRttPoints, setSheepRttPoints} from '@slices/sheepRttPointsSlice'
import {FeatureCollection, Point} from 'geojson'
import {Button} from '@material-ui/core'

const SheepPointSaveLoad = () => {

    const dispatch = useDispatch()
    const sheepRttPoints = useSelector(selectSheepRttPoints)

    function saveSheepRttPoints() {
        const {dialog} = require('electron').remote
        dialog.showSaveDialog({title: 'Save Sheep Rtt Data', defaultPath: 'sheep-rtt-data-' + format(new Date(), 'yyyy-MM-dd_HH-mm-ss'), filters: [{name: '', extensions: ['json']}]})
            .then(saveDialogReturnValue => {
                if (!saveDialogReturnValue.canceled && saveDialogReturnValue.filePath) {
                    writeFile(saveDialogReturnValue.filePath, JSON.stringify(sheepRttPoints), (err) => {
                        if (err) {
                            alert("An error occurred when creating the file: " + err.message)
                            return
                        }

                        alert("The file has been saved successfully")
                    })
                }
            })

    }

    function loadSheepRttPoints() {
        const {dialog} = require('electron').remote
        dialog.showOpenDialog({
            title: 'Load Sheep Rtt Data',
            buttonLabel: 'Load',
            filters: [{name: '', extensions: ['json']}],
        })
            .then(openDialogReturnValue => {
                const [filePath] = openDialogReturnValue.filePaths
                if (!openDialogReturnValue.canceled && filePath) {
                    readFile(filePath, 'utf-8', (err, data) => {
                        if (err) {
                            alert("An error occurred when reading the file: " + err.message)
                            return
                        }

                        try {
                            const sheepRttPoints = JSON.parse(data) as FeatureCollection<Point>
                            dispatch(setSheepRttPoints(sheepRttPoints))
                        } catch (_) {
                            alert('Invalid file format')
                        }
                    })
                }
            })
    }

    return (
        <>
            <Button size="small" onClick={saveSheepRttPoints} disabled={sheepRttPoints.features.length === 0}>Save sheep rtt data</Button>
            <Button size="small" onClick={loadSheepRttPoints}>Load sheep rtt data</Button>
        </>
    )
}

SheepPointSaveLoad.propTypes = {}

export default SheepPointSaveLoad
