import {Icon} from '@blueprintjs/core';
import * as React from 'react';
import {
	Theme,
	IThemeAware,
	IThemeMutatorAware,
	ThemeMutatorCallback,
	withThemeContext,
	withThemeMutatorContext,
} from './Contexts/ThemeContext';
import './ThemeSwitcher.scss';

const onThemeToggle = (currentTheme: Theme, callback: ThemeMutatorCallback) => {
	const nextTheme = currentTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK;

	callback(nextTheme);
};

interface IThemeSwitcherProps extends IThemeAware, IThemeMutatorAware {
}

const ThemeSwitcherComponent: React.SFC<IThemeSwitcherProps> = props => (
	<div id="theme-switcher-component" onClick={() => onThemeToggle(props.theme, props.onThemeChange)}>
		<Icon icon={props.theme === Theme.DARK ? 'flash' : 'moon'} />
	</div>
);

export const ThemeSwitcher = withThemeContext(withThemeMutatorContext(ThemeSwitcherComponent));
