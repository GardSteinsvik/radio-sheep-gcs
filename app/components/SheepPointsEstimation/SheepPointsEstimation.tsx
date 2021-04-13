import React, {useState} from 'react'
import {useDispatch, useSelector} from "react-redux";
import {selectSheepRttPoints} from "@slices/sheepRttPointsSlice";
import {Button} from '@material-ui/core';
import {Feature, Point, Polygon, Position} from "geojson";
import * as turf from "@turf/turf";
import {setEstimatedSheepPoints} from "@slices/estimatedSheepPointsSlice";

const NUMBER_OF_PARTICLES = 1000

const SheepPointsEstimation = () => {
    const dispatch = useDispatch()

    const sheepRttPoints = useSelector(selectSheepRttPoints)

    const [count, setCount] = useState(1)

    function estimatePoints() {
        const pointsPerSheep: {[id: string]: Feature<Point>[]} = {}
        sheepRttPoints.features.forEach((feature: Feature<Point>) => Object.assign(pointsPerSheep, {[`${feature.properties?.tid}`]: pointsPerSheep[`${feature.properties?.tid}`] ? [...pointsPerSheep[`${feature.properties?.tid}`], feature] : [feature]}))

        const estimatedPoints: Feature<Point>[] = Object.keys(pointsPerSheep).map((sheepId: string) => {
            const rttPoints: Feature<Point>[] = pointsPerSheep[sheepId]

            const radii = rttPoints.map((rttPoint: Feature<Point>) => rttPoint.properties?.dis ?? 0)
            const [minRadius, maxRadius] = [Math.min(...radii), Math.max(...radii)]
            const weightDampening = 17 + (20 / rttPoints.length)

            console.log(`[min, max, weightDampening, sampleCount]`, minRadius, maxRadius, weightDampening, rttPoints.length)

            const particles: Feature<Point>[] = []

            rttPoints.forEach((rttPoint: Feature<Point>) => {
                const radius = rttPoint.properties?.dis ?? 0

                const weight = (1 + maxRadius - minRadius) / (weightDampening + 1 + radius - minRadius)

                const circlePolygon = turf.circle(rttPoint, radius || 1, {steps: weight * NUMBER_OF_PARTICLES, units: "meters"}) as Feature<Polygon>

                const particlesForRttPoint: Feature<Point>[] = circlePolygon.geometry.coordinates[0].map((position: Position, i) => ({
                    type: "Feature",
                    id: `${rttPoint.id}-${i}`,
                    properties: {},
                    geometry: {type: "Point", coordinates: position},
                }))

                particles.push(...particlesForRttPoint)
            })

            const meanPoint = turf.centerMedian({type: "FeatureCollection", features: particles}) as Feature<Point>
            meanPoint.id = sheepId
            return meanPoint
        })

        dispatch(setEstimatedSheepPoints({type: "FeatureCollection", features: estimatedPoints}))
        setCount(count + 1)
    }

    return (
        <Button variant={"outlined"} disabled={sheepRttPoints.features.length === 0} onClick={estimatePoints}>Estimate!</Button>
    )
}

export default SheepPointsEstimation
