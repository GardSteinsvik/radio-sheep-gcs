import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {RootState} from '../store'
import {DroneStatus} from "@interfaces/DroneStatus"

const droneStatusSlice = createSlice({
    name: 'droneStatus',
    initialState: {value: <DroneStatus> {}},
    reducers: {
        setDroneStatus: (state, action: PayloadAction<DroneStatus>) => {
                state.value = {...Object.assign(state.value, action.payload)};
        },
        removeDroneStatus: (state) => {
            state.value = {};
        },
    },
});

export const {setDroneStatus, removeDroneStatus} = droneStatusSlice.actions;

export default droneStatusSlice.reducer;

export const selectDroneStatus = (state: RootState) => state.droneStatus.value;
