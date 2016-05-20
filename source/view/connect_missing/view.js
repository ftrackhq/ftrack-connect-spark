// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { connect } from 'react-redux';
import Button from 'react-toolbox/lib/button';

import { applicationAuthenticate } from 'action/application';
import EmptyState from 'component/empty_state';


/** Connect missing view. */
function _ConnectMissingView({ onRetryClicked }) {
    return (
        <EmptyState
            icon="cloud_off"
            message={(
                <span>
                    You don't seem to have <a href="https://www.ftrack.com/portfolio/connect" target="_blank">ftrack Connect</a> installed.
                    <br />
                    Connect is required to communicate with ftrack.
                </span>
            )}
        >
            <div>
                <Button
                    label="Retry"
                    raised
                    primary
                    onClick={onRetryClicked}
                />
                <p className="padding-normal">
                    <a href="https://ftrack.com/adobe" target="_blank">
                        Why do I need this?
                    </a>
                </p>
            </div>
        </EmptyState>
    );
}

_ConnectMissingView.propTypes = {
    onRetryClicked: React.PropTypes.func,
};

function mapDispatchToProps(dispatch) {
    return {
        onRetryClicked() {
            dispatch(applicationAuthenticate());
        },
    };
}

const ConnectMissingView = connect(
    null,
    mapDispatchToProps
)(_ConnectMissingView);

export default ConnectMissingView;
