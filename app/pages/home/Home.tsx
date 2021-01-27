import React from 'react';
import {Link} from 'react-router-dom';
import {makeStyles, Theme} from "@material-ui/core/styles";
import {createStyles, useTheme} from "@material-ui/core";
import * as path from "path";
import {routes} from "@/App";

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
        width: '100%',
        padding: theme.spacing(4),
    },
    content: {
        position: 'absolute',
        top: '30%',
        left: 10,
        textAlign: 'center',
    },
    image: {
        position: 'absolute',
        bottom: theme.spacing(2),
        right: theme.spacing(2),
    },
}))

export default function Home(): JSX.Element {
    const theme = useTheme()
    const classes = useStyles(theme)

    return (
      <div className={classes.root}>
          <div className={classes.content}>
              <h2>Sheep Search</h2>
              <div>
                  <Link to={routes.FLIGHT}>to Flight</Link>
              </div>
          </div>
          <img src={path.resolve(__dirname, 'pages/home', 'ntnu_bredde_eng.png')}
               alt={''}
               className={classes.image}
               width={600}
          />
      </div>
    )
}
