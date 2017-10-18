// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Menu } from 'react-toolbox/lib/menu';
import classNames from 'classnames';

import style from './style.scss';

/** Button menu component used to display a button that trigger a menu. */
export default class ButtonMenu extends React.Component {
    constructor() {
        super();
        this.state = { active: false };
        this.hideMenu = this.setState.bind(this, { active: false });
        this.showMenu = this.setState.bind(this, { active: true });
    }

    render() {
        const { children, onSelect, button, className, position } = this.props;
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
                    active={this.state.active}
                    onHide={this.hideMenu}
                    position={position}
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
    position: React.PropTypes.string,
    children: React.PropTypes.array,
    onSelect: React.PropTypes.func.isRequired,
};

ButtonMenu.defaultProps = {
    className: '',
};

