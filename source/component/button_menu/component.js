// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Menu } from 'react-toolbox/lib/menu';
import classNames from 'classnames';

import style from './style.scss';

/** Button menu component used to display a button that trigger a menu. */
export default class ButtonMenu extends React.Component {

    /** Show the menu. */
    showMenu() {
        this.refs.menu.show();
    }

    render() {
        const { children, onSelect, button, className } = this.props;
        const _classNames = classNames(style.wrapper, className);
        const clonedButton = React.cloneElement(
            button,
            {
                onClick: () => this.showMenu(),
            }
        );

        return (
            <div className={_classNames}>
                {clonedButton}
                <Menu
                    position="auto"
                    ref="menu"
                    onSelect={onSelect}
                    menuRipple
                    className={style.menu}
                >
                    {children}
                </Menu>
            </div>
        );
    }
}

ButtonMenu.propTypes = {
    className: React.PropTypes.string,
    button: React.PropTypes.node.isRequired,
    children: React.PropTypes.array,
    onSelect: React.PropTypes.func.isRequired,
};

ButtonMenu.defaultProps = {
    className: '',
};

