// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import Button from 'react-toolbox/lib/button';
import Input from 'react-toolbox/lib/input';

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
        return (
            <div className={style.example}>
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
    onButtonClicked: React.PropTypes.func,
    buttonLabel: React.PropTypes.string,
};

Example.defaultProps = {
    buttonLabel: 'Press me.',
};

export default Example;
