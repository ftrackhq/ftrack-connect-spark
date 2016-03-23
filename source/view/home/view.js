// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Link } from 'react-router';
import Header from 'component/header';
import { Button, Menu, MenuItem } from 'react-toolbox';
import { browserHistory } from 'react-router';

import style from './style.scss';


/** Push new route on item selected. */
const navigateToMenu = (value) => {
    browserHistory.push(`/${value}`);
};

/** Home view */
class HomeView extends React.Component {
    constructor() {
        super();
        this._onShareClick = this._onShareClick.bind(this);
    }

    _onShareClick() {
        this.refs.menu.show();
    }

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
            <div>
                <Header title="" rightButton={shareButton} color="dark-100" />
                <div className={style.home}>
                    <h2 className={style.title}>ftrack connect spark</h2>
                    <p><Link to="/example">To example view</Link></p>
                    <p><Link to="/context/projects/context">Browse</Link></p>
                </div>
            </div>
        );
    }
}

export default HomeView;
