import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';
import {FeatureCollection, Point} from "geojson";

const sheepRttPoints = createSlice({
    name: 'sheepRttPoints',
    initialState: {value: <FeatureCollection<Point>> {type: "FeatureCollection", features: []}},
    reducers: {
        setSheepRttPoints: (state, action: PayloadAction<FeatureCollection<Point>>) => {
            state.value = action.payload;
        },
        removeSheepRttPoints: (state) => {
            state.value = {type: "FeatureCollection", features: []};
        },
    },
});

export const {setSheepRttPoints, removeSheepRttPoints} = sheepRttPoints.actions;

export default sheepRttPoints.reducer;

export const selectSheepRttPoints = (state: RootState) => state.sheepRttPoints.value;
