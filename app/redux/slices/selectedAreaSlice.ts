import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';
import {Feature, Polygon} from "geojson";

const selectedAreaSlice = createSlice({
    name: 'selectedArea',
    initialState: {value: <Feature<Polygon> | undefined> undefined},
    reducers: {
        setSelectedArea: (state, action: PayloadAction<Feature<Polygon>>) => {
            state.value = action.payload;
        },
        removeSelectedArea: (state) => {
            state.value = undefined;
        },
    },
});

export const {setSelectedArea, removeSelectedArea} = selectedAreaSlice.actions;

export default selectedAreaSlice.reducer;

export const selectSelectedArea = (state: RootState) => state.selectedArea.value;
