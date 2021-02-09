import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';
import {MapParameters} from "@interfaces/MapParameters";

const initialValues = ({elevationProfileVisibility: 30})

const mapParametersSlice = createSlice({
    name: 'mapParameters',
    initialState: {value: <MapParameters> initialValues},
    reducers: {
        setMapParameters: (state, action: PayloadAction<MapParameters>) => {
                state.value = {...Object.assign(state.value, action.payload)};
        },
        removeMapParameters: (state) => {
            state.value = initialValues;
        },
    },
});

export const {setMapParameters, removeMapParameters} = mapParametersSlice.actions;

export default mapParametersSlice.reducer;

export const selectMapParameters = (state: RootState) => state.mapParameters.value;
