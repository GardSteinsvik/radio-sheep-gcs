import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';
import {format} from "date-fns";

const statusTextsSlice = createSlice({
    name: 'statusTexts',
    initialState: {value: <string[]> []},
    reducers: {
        addStatusText: (state, action: PayloadAction<string>) => {
            state.value = [`[${format(new Date(), 'HH:mm:ss')}] ${action.payload}`, ...state.value];
        },
        removeStatusTexts: (state) => {
            state.value = [];
        },
    },
});

export const {addStatusText, removeStatusTexts} = statusTextsSlice.actions;

export default statusTextsSlice.reducer;

export const selectStatusTexts = (state: RootState) => state.statusTexts.value;
