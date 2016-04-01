// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Tab, Tabs } from 'react-toolbox';

import HomeHeader from 'container/home_header';


/** Home view */
class ContextView extends React.Component {

    constructor() {
        super();
        this.state = { index: 0 };
        this._handleTabChange = this._handleTabChange.bind(this);
    }

    _handleTabChange(index) {
        this.setState({ index });
    }

    render() {
        const context = this.props.params.context;
        return (
            <div>
                <HomeHeader back context={context} />
                <p>{context}</p>
                <Tabs index={this.state.index} onChange={this._handleTabChange}>
                    <Tab label="Notes">
                        <div>
                            Notes on the context.
                        </div>
                    </Tab>
                    <Tab label="Versions">
                        <div>
                            Versions on the contex.
                        </div>
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

ContextView.propTypes = {
    params: React.PropTypes.object,
};

ContextView.defaultProps = {
    params: {},
};

export default ContextView;
