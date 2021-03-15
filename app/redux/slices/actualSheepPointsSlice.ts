import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';
import {FeatureCollection, Point} from "geojson";

const actualSheepPoints = createSlice({
    name: 'actualSheepPoints',
    initialState: {value: <FeatureCollection<Point>> {type: "FeatureCollection", features: []}},
    reducers: {
        setActualSheepPoints: (state, action: PayloadAction<FeatureCollection<Point>>) => {
            state.value = action.payload;
        },
        removeActualSheepPoints: (state) => {
            state.value = {type: "FeatureCollection", features: []};
        },
    },
});

export const {setActualSheepPoints, removeActualSheepPoints} = actualSheepPoints.actions;

export default actualSheepPoints.reducer;

export const selectActualSheepPoints = (state: RootState) => state.actualSheepPoints.value;
