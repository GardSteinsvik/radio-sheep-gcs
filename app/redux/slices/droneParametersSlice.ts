import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {RootState} from '../store'
import {DroneParameter, DroneParameters} from '@interfaces/DroneParameter'

const droneParametersSlice = createSlice({
    name: 'droneParameters',
    initialState: {value: <DroneParameters> {}},
    reducers: {
        setAllDroneParameters: (state, action: PayloadAction<DroneParameters>) => {
                state.value = action.payload;
        },
        setDroneParameter: (state, action: PayloadAction<{targetSystemId: number, targetComponentId: number, droneParameter: DroneParameter}>) => {
            const targetKey = `${action.payload.targetSystemId}-${action.payload.targetComponentId}`
            state.value = {
                ...state.value,
                [targetKey]: {...Object.assign(state.value[targetKey] ?? {}, action.payload.droneParameter)}
            };
        },
        removeDroneParameters: (state) => {
            state.value = {};
        },
    },
});

export const {setAllDroneParameters, setDroneParameter, removeDroneParameters} = droneParametersSlice.actions;

export default droneParametersSlice.reducer;

export const selectDroneParameters = (state: RootState) => state.droneParameters.value;
