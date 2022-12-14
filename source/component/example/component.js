// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import Button from 'react-toolbox/lib/button';
import Input from 'react-toolbox/lib/input';
import PropTypes from 'prop-types';

import style from './style.scss';


/** An example component. */
class Example extends React.Component {
    constructor() {
        super();
        this.state = { message: '' };
        this._onMessageChange = this._onMessageChange.bind(this);
        this._onButtonClicked = this._onButtonClicked.bind(this);
    }

    _onMessageChange(value) {
        this.setState({ message: value });
    }

    _onButtonClicked() {
        this.props.onButtonClicked(this.state.message);
    }

    render() {
        let userMessage;
        if (this.props.user) {
            userMessage = (
                <p>
                    Signed in as <em>{this.props.user.username}</em>
                </p>
            );
        } else {
            userMessage = <p>Not signed in</p>;
        }

        return (
            <div className={style.example}>
                {userMessage}
                <Input
                    type="text"
                    label="Message"
                    name="message"
                    value={this.state.message}
                    onChange={this._onMessageChange}
                />
                <Button
                    label={this.props.buttonLabel}
                    raised
                    accent
                    onClick={this._onButtonClicked}
                />
            </div>
        );
    }
}

Example.propTypes = {
    onButtonClicked: PropTypes.func,
    buttonLabel: PropTypes.string,
    user: PropTypes.object,
};

Example.defaultProps = {
    buttonLabel: 'Press me.',
    user: null,
};

export default Example;
