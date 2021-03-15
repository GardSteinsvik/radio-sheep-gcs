import React, {useEffect, useState} from 'react'
import {useDispatch} from "react-redux";
import {setActualSheepPoints} from '@/redux/slices/actualSheepPointsSlice';

const SheepUpload = () => {
    const dispatch = useDispatch()

    const [sheepGeoJsonString, setSheepGeoJsonString] = useState<string>('')

    useEffect(() => {
        if (!sheepGeoJsonString) return

        try {
            const parsedGeoJSON = JSON.parse(sheepGeoJsonString)
            dispatch(setActualSheepPoints(parsedGeoJSON))
        } catch (_) {

        }
    }, [sheepGeoJsonString])

    return (
        <textarea
            style={{height: 28, width: 60, resize: 'none'}}
            value={sheepGeoJsonString}
            onChange={event => setSheepGeoJsonString(event.target.value)}
        />
    )
}

export default SheepUpload
