// :copyright: Copyright (c) 2016 ftrack
import React from 'react';

import Autocomplete from 'react-toolbox/lib/autocomplete';

/**
 * Selector
 *
 * TODO: Improve UX of Autocomplete with multiple=false.
 * Show all alternatives when opening dropdown with an active selection.
 */
class Selector extends React.Component {
    constructor() {
        super();
        this.state = { value: null, source: {} };
        this._onChange = this._onChange.bind(this);
    }

    /** Load the data on render. */
    componentDidMount() {
        this.props.query.then((data) => {
            this.setState({ source: data });
        });
    }

    /** Update internal state and call prop.onChange on change. */
    _onChange(value) {
        this.setState({ value });
        // Trigger blur to set redux form's touched state.
        this.props.onBlur(this.state.value);

        this.props.onChange(value);
    }

    _errorMessage(field) {
        return field.touched && field.error || null;
    }

    render() {
        return (
            <Autocomplete
                direction="down"
                multiple={false}
                source={this.state.source}
                {...this.props}
                value={this.state.source[this.state.value] || ''}
                onChange={this._onChange}
                error={this._errorMessage(this.props)}
            />
        );
    }
}

Selector.propTypes = {
    onChange: React.PropTypes.func,
    onBlur: React.PropTypes.func,
    query: React.PropTypes.object,
};

export default Selector;
