import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';
import {Feature, Point} from "geojson";

const selectedPointSlice = createSlice({
    name: 'selectedPoint',
    initialState: {value: <Feature<Point> | undefined> undefined},
    reducers: {
        setSelectedPoint: (state, action: PayloadAction<Feature<Point>>) => {
            state.value = action.payload;
        },
        removeSelectedPoint: (state) => {
            state.value = undefined;
        },
    },
});

export const {setSelectedPoint, removeSelectedPoint} = selectedPointSlice.actions;

export default selectedPointSlice.reducer;

export const selectSelectedPoint = (state: RootState) => state.selectedPoint.value;
