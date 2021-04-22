import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';
import {Feature, FeatureCollection, Point} from "geojson";

const sheepRttPoints = createSlice({
    name: 'sheepRttPoints',
    initialState: {value: <FeatureCollection<Point>> {type: "FeatureCollection", features: []}},
    reducers: {
        storeSheepRttPoint: (state, action: PayloadAction<Feature<Point>>) => {
            const index = state.value.features.findIndex(({id}) => id === action.payload.id)
            const features = state.value.features.slice();
            if (index === -1) {
                features.push(action.payload)
            } else {
                features[index] = action.payload
            }
            state.value = {
                type: 'FeatureCollection',
                features,
            }
        },
        addRssiData: (state, action: PayloadAction<number[]>) => {
            const [sampleId, rssi] = action.payload
            const features = state.value.features.slice();
            const sheepRttDataFeature: Feature<Point> | undefined = features.find(feature => feature.id === sampleId)
            if (sheepRttDataFeature) {
                sheepRttDataFeature.properties = {
                    ...sheepRttDataFeature?.properties,
                    rssi
                }

                state.value = {
                    type: 'FeatureCollection',
                    features,
                }
            }
        },
        setSheepRttPoints: (state, action: PayloadAction<FeatureCollection<Point>>) => {
            state.value = action.payload;
        },
        removeSheepRttPoints: (state) => {
            state.value = {type: "FeatureCollection", features: []};
        },
    },
});

export const {storeSheepRttPoint, addRssiData, setSheepRttPoints, removeSheepRttPoints} = sheepRttPoints.actions;

export default sheepRttPoints.reducer;

export const selectSheepRttPoints = (state: RootState) => state.sheepRttPoints.value;
