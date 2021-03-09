import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router';
import {History} from 'history';
import selectedAreaReducer from './slices/selectedAreaSlice';
import selectedPointReducer from './slices/selectedPointSlice';
import completedPointsReducer from './slices/completedPointsSlice'
import statusTextsReducer from "./slices/statusTextsSlice";
import droneStatusReducer from './slices/droneStatusSlice'
import flightParametersReducer from "./slices/flightParametersSlice";
import elevationProfileSlice from "@slices/elevationProfileSlice";
import mapParametersSlice from "@slices/mapParametersSlice";
import sheepRttPointsSlice from "@slices/sheepRttPointsSlice";
import selectedSheepRttPointSlice from "@slices/selectedSheepRttPointSlice";
import estimatedSheepPointsSlice from "@slices/estimatedSheepPointsSlice";

export default function createRootReducer(history: History) {
    return combineReducers({
        router: connectRouter(history),
        selectedArea: selectedAreaReducer,
        selectedPoint: selectedPointReducer,
        completedPoints: completedPointsReducer,
        statusTexts: statusTextsReducer,
        droneStatus: droneStatusReducer,
        flightParameters: flightParametersReducer,
        elevationProfile: elevationProfileSlice,
        mapParameters: mapParametersSlice,
        sheepRttPoints: sheepRttPointsSlice,
        selectedSheepRttPoint: selectedSheepRttPointSlice,
        estimatedSheepPoints: estimatedSheepPointsSlice,
    });
}
