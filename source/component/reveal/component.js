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
    constructor(props) {
        super(props);
        this.state = { active: props.active };
        this._onButtonClicked = this._onButtonClicked.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.active !== this.props.active) {
            this.setState({ active: nextProps.active });
        }
    }

    _onButtonClicked() {
        this.setState({ active: true });
    }

    render() {
        const className = classNames(style.link, this.props.className);

        let content = null;
        if (this.state.active) {
            content = this.props.children;
        } else if (this.props.label || this.props.icon) {
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
    children: React.PropTypes.node.isRequired,
    active: React.PropTypes.bool,
    className: React.PropTypes.string,
    label: React.PropTypes.string,
    icon: React.PropTypes.string,
};

Reveal.defaultProps = {
    className: '',
    active: false,
    label: null,
    icon: null,
};

export default Reveal;
