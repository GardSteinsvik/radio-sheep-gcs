import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';
import {FlightParameters} from "@interfaces/FlightParameters";

const initialValues = ({elevation: 30, velocity: 5, searchRadius: 50, searchRadiusOverlap: 0, acceptanceRadius: 4})

const flightParametersSlice = createSlice({
    name: 'flightParameters',
    initialState: {value: <FlightParameters> initialValues},
    reducers: {
        setFlightParameters: (state, action: PayloadAction<FlightParameters>) => {
                state.value = {...Object.assign(state.value, action.payload)};
        },
        removeFlightParameters: (state) => {
            state.value = initialValues;
        },
    },
});

export const {setFlightParameters, removeFlightParameters} = flightParametersSlice.actions;

export default flightParametersSlice.reducer;

export const selectFlightParameters = (state: RootState) => state.flightParameters.value;
