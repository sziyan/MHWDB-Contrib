import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import {Theme} from '@material-ui/core/styles/createMuiTheme';
import createStyles from '@material-ui/core/styles/createStyles';
import withStyles, {WithStyles} from '@material-ui/core/styles/withStyles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import {MainNavList} from './Navigation/MainNavList';

const styles = (theme: Theme) => createStyles({
	root: {
		flexGrow: 1,
		height: '100%',
		zIndex: 1,
		overflow: 'hidden',
		position: 'relative',
		display: 'flex',
	},
	appBar: {
		zIndex: theme.zIndex.drawer + 1,
	},
	drawer: {
		height: '100%',
	},
	drawerPaper: {
		position: 'relative',
		width: 240,
	},
	toolbar: theme.mixins.toolbar,
	content: {
		flexGrow: 1,
		backgroundColor: theme.palette.background.default,
		padding: theme.spacing.unit * 3,
		minWidth: 0,
		flex: '1 1 100%',
	},
});

interface AppProps extends WithStyles<typeof styles> {
}

const AppComponent: React.SFC<AppProps> = props => {
	const {classes} = props;

	return (
		<div className={classes.root}>
			<AppBar position="absolute" className={classes.appBar}>
				<Toolbar>
					<Typography variant="title" color="inherit" noWrap={true}>
						Monster Hunter: World DB
					</Typography>
				</Toolbar>
			</AppBar>

			<Drawer variant="permanent" className={classes.drawer} classes={{paper: classes.drawerPaper}}>
				<div className={classes.toolbar} />

				<MainNavList />
			</Drawer>

			<main className={classes.content}>
				<div className={classes.toolbar} />

				Main content.
			</main>
		</div>
	);
};

export const App = withStyles(styles)(AppComponent);