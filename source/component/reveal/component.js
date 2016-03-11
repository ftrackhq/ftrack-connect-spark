// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import Link from 'react-toolbox/lib/link';
import classNames from 'classnames';

import style from './style';


/**
 * Reveal component.
 *
 * Shows a clickable link until active, then children.
 */
class Reveal extends React.Component {
    constructor() {
        super();
        this.state = { active: false };
        this._onButtonClicked = this._onButtonClicked.bind(this);
    }

    _onButtonClicked() {
        this.setState({ active: true });
    }

    render() {
        const className = classNames(style.link, this.props.className);

        let content = null;
        if (this.state.active) {
            content = this.props.children;
        } else {
            content = (
                <Link
                    className={className}
                    label={this.props.label}
                    icon={this.props.icon}
                    onClick={this._onButtonClicked}
                />
            );
        }
        return (
            <div>
                {content}
            </div>
        );
    }
}

Reveal.propTypes = {
    children: React.PropTypes.node,
    className: React.PropTypes.string,
    label: React.PropTypes.string,
    icon: React.PropTypes.string,
};

Reveal.defaultProps = {
    className: '',
    label: 'show',
    icon: null,
};

export default Reveal;
