import React, {useEffect} from 'react'
import {useDispatch, useSelector} from "react-redux"
import {selectSheepRttPoints} from "@slices/sheepRttPointsSlice"
import {Button} from '@material-ui/core'
import {Feature, Point, Polygon, Position} from "geojson"
import * as turf from "@turf/turf"
import {mean, std} from 'mathjs'
import {
    removeEstimatedSheepPoints,
    selectEstimatedSheepPoints,
    setEstimatedSheepPoints,
} from "@slices/estimatedSheepPointsSlice"
import {selectActualSheepPoints} from '@slices/actualSheepPointsSlice'

const NUMBER_OF_PARTICLES = 360

function particleMean(pointsPerSheep: { [id: string]: Feature<Point>[] }): Feature<Point>[] {
    return Object.keys(pointsPerSheep).map((sheepId: string) => {
        const rttPoints: Feature<Point>[] = pointsPerSheep[sheepId]
        let particles: Feature<Point>[] = []

        rttPoints.forEach((rttPoint: Feature<Point>) => {
            const radius = rttPoint.properties?.dis ?? 0

            const circlePolygon = turf.circle(rttPoint, radius || 1, {
                steps: NUMBER_OF_PARTICLES,
                units: "meters"
            }) as Feature<Polygon>

            const particlesForRttPoint: Feature<Point>[] = circlePolygon.geometry.coordinates[0].map((position: Position, i) => ({
                type: "Feature",
                id: `${rttPoint.id}-${i}`,
                properties: {},
                geometry: {type: "Point", coordinates: position},
            }))

            particles.push(...particlesForRttPoint)
        })

        // const clusters = turf.clustersDbscan({type: 'FeatureCollection', features: particles}, 3, {units: 'meters'})
        // const clusterCounts: {[key: string]: number} = {}
        // clusters.features.filter(p => p.properties.dbscan === 'core').forEach(p => clusterCounts[`c${p.properties.cluster}`] = (clusterCounts[`c${p.properties.cluster}`] ?? 0) + 1)
        // const topClusterCount = Math.max(...Object.values(clusterCounts))
        //
        // const topClusterIds: string[] = Object.keys(clusterCounts).filter(cid => clusterCounts[cid] === topClusterCount)
        //
        // console.log(clusterCounts)
        // console.log(topClusterIds)
        //
        // // console.log(clusters.features.length, clusters.features.filter(p => p.properties.dbscan === 'core').length)
        // // console.log(clusters.features.filter(p => p.properties.dbscan === 'core'))
        //
        // particles = clusters.features.filter(p => p.properties.dbscan === 'core' && topClusterIds.includes(`c${p.properties.cluster}`)) as Feature<Point>[]
        //
        // dispatch(setActualSheepPoints({type: 'FeatureCollection', features: particles}))

        const lonSeries = particles.map(p => p.geometry.coordinates[0]).sort()
        const latSeries = particles.map(p => p.geometry.coordinates[1]).sort()

        const meanPoint: Feature<Point> = {
            type: 'Feature',
            id: sheepId,
            properties: {
                uncertainty: turf.distance([0, 0], [0, Math.max(std(lonSeries), std(latSeries))], {units: 'meters'})
            },
            geometry: {
                type: "Point",
                coordinates: [mean(...lonSeries), mean(latSeries)]
            }
        }

        console.group(sheepId + ' LON')
        console.log(std(lonSeries))
        console.log(JSON.stringify(lonSeries))
        console.groupEnd()
        console.group(sheepId + ' LAT')
        console.log(std(latSeries))
        console.log(JSON.stringify(latSeries))
        console.groupEnd()

        return meanPoint
    })
}

function intersectionMean(pointsPerSheep: {[id: string]: Feature<Point>[]}): Feature<Point>[] {

    return Object.keys(pointsPerSheep).map((sheepId: string) => {
        const rttPoints: Feature<Point>[] = pointsPerSheep[sheepId]

        let errorRadius = 0
        let completeIntersection = null
        while (completeIntersection === null) {
            const circles = rttPoints.map((rttPoint: Feature<Point>) => turf.circle(rttPoint, (rttPoint.properties?.dis || 1) + errorRadius, {steps: NUMBER_OF_PARTICLES, units: "meters"})) as Feature<Polygon>[]

            let currentIntersection: Feature<Polygon> | null = circles[0]
            for (let i = 1; i < circles.length; i++) {
                const currentCircle = circles[i]

                if (currentIntersection === null) break

                currentIntersection = turf.intersect(currentIntersection, currentCircle) as Feature<Polygon> | null

                if (currentIntersection === null) {
                    errorRadius = errorRadius * 2 || 1
                    console.log("Increasing error radius: ", errorRadius)
                    break
                }
            }

            if (currentIntersection !== null) {
                completeIntersection = currentIntersection
            }
        }

        console.log(JSON.stringify(completeIntersection))

        const points = turf.explode(completeIntersection)

        const meanPoint = turf.centerMean(points) as Feature<Point>
        meanPoint.id = sheepId

        return  meanPoint
    })
}

const SheepPointsEstimation = () => {
    const dispatch = useDispatch()

    const sheepRttPoints = useSelector(selectSheepRttPoints)
    const estimatedSheepPoints = useSelector(selectEstimatedSheepPoints)
    const actualSheepPoints = useSelector(selectActualSheepPoints)

    function estimatePoints(type: string) {
        const pointsPerSheep: {[id: string]: Feature<Point>[]} = {}
        sheepRttPoints.features.forEach((feature: Feature<Point>) => Object.assign(pointsPerSheep, {[`${feature.properties?.tid}`]: pointsPerSheep[`${feature.properties?.tid}`] ? [...pointsPerSheep[`${feature.properties?.tid}`], feature] : [feature]}))

        let estimatedPoints: Feature<Point>[] = []

        switch (type) {
            case 'intersectionMean':
                estimatedPoints = intersectionMean(pointsPerSheep)
                break
            case 'particleMean':
                estimatedPoints = particleMean(pointsPerSheep)
                break

        }

        dispatch(setEstimatedSheepPoints({type: "FeatureCollection", features: estimatedPoints}))
    }

    useEffect(() => {
        if (estimatedSheepPoints.features.length === 0 || actualSheepPoints.features.length === 0) return

        const errorLengths: number[] = [
            ...estimatedSheepPoints.features.map(point => {
                const point2 = actualSheepPoints.features.find(p => `${p.id}` === `${point.id}`)
                if (!point2) return Infinity
                return turf.distance(point.geometry.coordinates, point2.geometry.coordinates, {units: "meters"})
            })
        ]

        const totalErrorLength = errorLengths.reduce((a, c) => a + c, 0)

        console.log('Min error length', Math.min(...errorLengths))
        console.log('Max error length', Math.max(...errorLengths))
        console.log('Average error length', totalErrorLength/estimatedSheepPoints.features.length)

    }, [estimatedSheepPoints, actualSheepPoints])

    return (
        <>
            <Button variant={"outlined"} disabled={sheepRttPoints.features.length === 0} onClick={() => estimatePoints('particleMean')}>Particle</Button>
            <Button variant={"outlined"} disabled={sheepRttPoints.features.length === 0} onClick={() => estimatePoints('intersectionMean')}>Intersection</Button>
            <Button onClick={() => dispatch(removeEstimatedSheepPoints())}>Clear</Button>
        </>
    )
}

export default SheepPointsEstimation
