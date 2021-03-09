import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';
import {FeatureCollection, Point} from "geojson";

const estimatedSheepPoints = createSlice({
    name: 'estimatedSheepPoints',
    initialState: {value: <FeatureCollection<Point>> {type: "FeatureCollection", features: []}},
    reducers: {
        setEstimatedSheepPoints: (state, action: PayloadAction<FeatureCollection<Point>>) => {
            state.value = action.payload;
        },
        removeEstimatedSheepPoints: (state) => {
            state.value = {type: "FeatureCollection", features: []};
        },
    },
});

export const {setEstimatedSheepPoints, removeEstimatedSheepPoints} = estimatedSheepPoints.actions;

export default estimatedSheepPoints.reducer;

export const selectEstimatedSheepPoints = (state: RootState) => state.estimatedSheepPoints.value;
