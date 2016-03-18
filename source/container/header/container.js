// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import AppBar from 'react-toolbox/lib/app_bar';
import { IconMenu, MenuItem } from 'react-toolbox';

import style from './style';


/** Header container containing share menu */
/* eslint-disable react/prefer-stateless-function */
class HeaderContainer extends React.Component {

    constructor() {
        super();
        this._onMenuItemSelected = this._onMenuItemSelected.bind(this);
    }

    /** Push new route on item selected. */
    _onMenuItemSelected(value) {
        this.context.router.push(`/${value}`);
    }

    render() {
        return (
            <AppBar flat className={style.appbar}>
                <h3 className={style.title}>ftrack</h3>
                <IconMenu
                    className={style.menu}
                    icon="share"
                    position="auto"
                    onSelect={this._onMenuItemSelected}
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
                </IconMenu>
            </AppBar>
        );
    }
}

HeaderContainer.contextTypes = {
    router: React.PropTypes.object,
};

export default HeaderContainer;
