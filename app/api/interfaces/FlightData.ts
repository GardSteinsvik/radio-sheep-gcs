import {FlightParameters} from './FlightParameters'
import {FeatureCollection, Point} from 'geojson'

/**
 * The format of the flight plans that are saved and loaded from the file system
 */
export interface FlightData {
    flightParameters: FlightParameters,
    completedPoints: FeatureCollection<Point>,
}
