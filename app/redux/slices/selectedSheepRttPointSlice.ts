import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';

const selectedSheepRttPointSlice = createSlice({
    name: 'selectedSheepRttPoint',
    initialState: {value: <number> 0},
    reducers: {
        setSelectedSheepRttPoint: (state, action: PayloadAction<number>) => {
            state.value = action.payload;
        },
        removeSelectedSheepRttPoint: (state) => {
            state.value = 0;
        },
    },
});

export const {setSelectedSheepRttPoint, removeSelectedSheepRttPoint} = selectedSheepRttPointSlice.actions;

export default selectedSheepRttPointSlice.reducer;

export const selectSelectedSheepRttPoint = (state: RootState) => state.selectedSheepRttPoint.value;
