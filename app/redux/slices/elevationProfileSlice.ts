import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {RootState} from '../store'
import {ElevationProfile} from '@interfaces/ElevationProfile'

const initialValues = undefined

const elevationProfileSlice = createSlice({
    name: 'elevatitonProfile',
    initialState: {value: <ElevationProfile | undefined> initialValues},
    reducers: {
        setElevationProfile: (state, action: PayloadAction<ElevationProfile>) => {
                state.value = action.payload
        },
        removeElevationProfile: (state) => {
            state.value = initialValues;
        },
    },
});

export const {setElevationProfile, removeElevationProfile} = elevationProfileSlice.actions;

export default elevationProfileSlice.reducer;

export const selectElevationProfile = (state: RootState) => state.elevationProfile.value;
