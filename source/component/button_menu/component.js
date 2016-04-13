// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Menu } from 'react-toolbox/lib/menu';
import style from './style.scss';

/** Button menu component used to display a button that trigger a menu. */
export default class ButtonMenu extends React.Component {

    /** Show the menu. */
    showMenu() {
        this.refs.menu.show();
    }

    render() {
        const { children, onSelect, button } = this.props;
        const clonedButton = React.cloneElement(
            button,
            {
                onClick: () => this.showMenu(),
            }
        );

        return (
            <div className={style.wrapper}>
                {clonedButton}
                <Menu position="auto" ref="menu" onSelect={onSelect} menuRipple>
                    {children}
                </Menu>
            </div>
        );
    }
}

ButtonMenu.propTypes = {
    button: React.PropTypes.node.isRequired,
    children: React.PropTypes.array,
    onSelect: React.PropTypes.func.isRequired,
};
