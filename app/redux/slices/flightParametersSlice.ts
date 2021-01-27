import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';
import {FlightParameters} from "../../api/interfaces/FlightParameters";

const initialValues = ({elevation: 100, velocity: 15})

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
