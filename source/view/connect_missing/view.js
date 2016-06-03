// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { connect } from 'react-redux';
import Button from 'react-toolbox/lib/button';

import { applicationAuthenticate } from 'action/application';
import EmptyState from 'component/empty_state';
import style from './style.scss';


/** Connect missing view. */
function _ConnectMissingView({ onRetryClicked }) {
    return (
        <EmptyState
            icon="cloud_off"
            message={(
                <span>
                    You don't seem to have <a href="https://www.ftrack.com/portfolio/connect" target="_blank">ftrack Connect</a> running.
                    <br />
                    Connect is required to communicate with ftrack.
                </span>
            )}
        >
            <div>
                <p className={style.instructions}>
                    To get you started, just follow the following simple steps:
                    <ol className={style['instructions-list']}>
                        <li><a href="https://www.ftrack.com/signup" target="_blank">Sign up for ftrack</a>, if you do not already have an account.</li>
                        <li>Download and install <a href="https://www.ftrack.com/connect" target="_blank">ftrack Connect</a>.</li>
                        <li>Launch Connect and sign in to your account.</li>
                    </ol>
                    For more information, see <a href="https://ftrack.com/adobe" target="_blank">ftrack.com/adobe</a>.
                </p>

                <Button
                    className={style['refresh-button']}
                    icon="refresh"
                    label="Retry"
                    raised
                    primary
                    onClick={onRetryClicked}
                />


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
