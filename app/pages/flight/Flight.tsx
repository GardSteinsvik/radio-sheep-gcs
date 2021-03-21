import React, {useState} from 'react'
import Map from "./Map"
import {Card, Theme, useTheme} from "@material-ui/core"
import {makeStyles} from "@material-ui/core/styles"
import {Feature} from "geojson"
import MapControl from "@/components/MapControl/MapControl"
import RoutePlanning from '@/pages/flight/RoutePlanning'

const useStyles = makeStyles({
    root: {
        display: 'flex',
        height: '100%',
    },
    sidebar: {
        minWidth: '20rem',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        padding: '2rem',
        overflow: 'auto',
    },
    map: {
        border: '1px solid lightgray',
        borderRadius: 8,
        position: 'relative',
        height: '80%',
        marginBottom: '1rem'
    }
})

export default function Flight() {
    const theme: Theme = useTheme()
    const classes = useStyles(theme)

    const [features, setFeatures] = useState<Feature[]>([])

    return (
        <div className={classes.root}>
            <aside className={classes.sidebar}>
                <Card variant={"outlined"}>
                    <RoutePlanning setFeaturesToDraw={setFeatures}/>
                </Card>
            </aside>
            <main className={classes.content}>
                <div className={classes.map}>
                    <Map features={features} />
                </div>
                <MapControl/>
            </main>
        </div>
    )
}
