import React, {ReactNode} from 'react';
import {Link, Route, Switch} from 'react-router-dom';
import {
    AppBar,
    createMuiTheme,
    createStyles,
    IconButton,
    ThemeProvider,
    Toolbar,
    Typography,
    useTheme
} from "@material-ui/core";
import {Provider} from "react-redux";
import {configuredStore, history} from "./redux/store";
import Flight from "@/pages/flight/Flight";
import {makeStyles, Theme} from "@material-ui/core/styles";
import Drone from "@/components/Drone/Drone";
import Home from "@/pages/home/Home";
import {ConnectedRouter} from "connected-react-router";

const store = configuredStore()

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#03A9F4',
        },
        secondary: {
            main: '#FFC107',
        },
    },
})

export const routes = {
    "HOME": "/",
    "FLIGHT": "/flight",
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
        height: '100%',
        width: '100%',
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        color: 'white',
        flexGrow: 1,
    },
    content: {
        height: '94%'
    },
}))

const AppLayout = (props: { children: ReactNode }) => {
    const theme = useTheme()
    const classes = useStyles(theme)

    return (
        <div className={classes.root}>
            <AppBar position={"static"}>
                <Toolbar>
                    <IconButton edge={"start"} className={classes.menuButton}>
                        <Link to={routes.HOME}>
                            <i className="fa fa-home"/>
                        </Link>
                    </IconButton>
                    <Typography variant={"h6"} className={classes.title}>Radio Sheep GCS</Typography>
                    <Drone/>
                </Toolbar>
            </AppBar>
            <div className={classes.content}>
                {props.children}
            </div>
        </div>
    )
}

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <AppLayout>
                        <Switch>
                            <Route exact path={routes.HOME} component={Home}/>
                            <Route exact path={routes.FLIGHT} component={Flight}/>
                        </Switch>
                    </AppLayout>
                </ConnectedRouter>
            </Provider>
        </ThemeProvider>
    );
}
