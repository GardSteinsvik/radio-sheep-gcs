import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';
import {FeatureCollection, Point} from "geojson";

const completedPoints = createSlice({
    name: 'completedPoints',
    initialState: {value: <FeatureCollection<Point>> {type: "FeatureCollection", features: []}},
    reducers: {
        setCompletedPoints: (state, action: PayloadAction<FeatureCollection<Point>>) => {
            state.value = action.payload;
        },
        removeCompletedPoints: (state) => {
            state.value = {type: "FeatureCollection", features: []};
        },
    },
});

export const {setCompletedPoints, removeCompletedPoints} = completedPoints.actions;

export default completedPoints.reducer;

export const selectCompletedPoints = (state: RootState) => state.completedPoints.value;
