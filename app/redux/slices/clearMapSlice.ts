import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';

const clearMapSlice = createSlice({
    name: 'clearMap',
  
    initialState: {
      toggle: false
    },
  
    reducers: {
      toggleClear: (state) => {
        state.toggle = !state.toggle;
      }
    }
  })

  export const {toggleClear} = clearMapSlice.actions;

  export default clearMapSlice.reducer;

  export const selectClearMap = (state: RootState) => state.clearMap.toggle;