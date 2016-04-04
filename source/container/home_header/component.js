// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import Header from 'component/header';
import { Button, Menu, MenuItem } from 'react-toolbox';
import { browserHistory } from 'react-router';

import style from './style.scss';

/** Push new route on item selected. */
const navigateToMenu = (value) => {
    browserHistory.push(`/${value}`);
};

/**
 * Home header component with actions.
 */
class HomeHeader extends React.Component {

    /** Instantiate home header. */
    constructor() {
        super();
        this._onShareClick = this._onShareClick.bind(this);
    }

    /** Show menu when share button is clicked */
    _onShareClick() {
        this.refs.menu.show();
    }

    /** Render component. */
    render() {
        const shareButton = (
            <div className={style.share}>
                <Button primary label="Share" onClick={this._onShareClick} />
                <Menu
                    ref="menu"
                    className={style.menu}
                    position="auto"
                    onSelect={navigateToMenu}
                    menuRipple
                >
                    <MenuItem
                        value="quick-review"
                        icon="play_circle_outline"
                        caption="Quick review"
                    />
                    <MenuItem
                        value="publish"
                        icon="file_upload"
                        caption="Publish"
                    />
                </Menu>
            </div>
        );

        return (
            <Header {...this.props} rightButton={shareButton} color="dark-100" />
        );
    }
}

export default HomeHeader;