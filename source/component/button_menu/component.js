// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Menu } from 'react-toolbox/lib/menu';
import { Button } from 'react-toolbox/lib/button';
import style from './style.scss';


export default class ButtonMenu extends React.Component {

    showMenu() {
        this.refs.menu.show();
    }

    render() {
        const { label, children, onSelect, className } = this.props;
        const buttonStyle = this.props.style;

        return (
            <div className={style.wrapper}>
                <Button
                    onClick={
                        () => this.showMenu()
                    }
                    label={label}
                    className={className}
                    style={buttonStyle}
                />
                <Menu position="auto" ref="menu" onSelect={onSelect} menuRipple>
                    {children}
                </Menu>
            </div>
        );
    }
}

ButtonMenu.propTypes = {
    children: React.PropTypes.array,
    label: React.PropTypes.string.isRequired,
    onSelect: React.PropTypes.func.isRequired,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
};
