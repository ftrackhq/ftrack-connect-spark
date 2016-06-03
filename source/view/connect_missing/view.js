// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { connect } from 'react-redux';
import Button from 'react-toolbox/lib/button';

import { applicationAuthenticate, applicationOpenLink } from 'action/application';
import EmptyState from 'component/empty_state';
import style from './style.scss';


/** Connect missing view. */
function _ConnectMissingView({ onRetryClicked, onLinkClicked }) {
    return (
        <EmptyState
            icon="cloud_off"
            message={(
                <span>
                    You don't seem to have <a
                        href="https://www.ftrack.com/portfolio/connect"
                        target="_blank"
                        onClick={onLinkClicked}
                    >ftrack Connect</a> running.
                    <br />
                    Connect is required to communicate with ftrack.
                </span>
            )}
        >
            <div>
                <div className={style.instructions}>
                    <p>
                        To get you started, just follow the following simple steps:
                    </p>
                    <ol className={style['instructions-list']}>
                        <li>
                            <a
                                href="https://www.ftrack.com/signup"
                                target="_blank"
                                onClick={onLinkClicked}
                            >
                                Sign up for ftrack
                            </a>, if you do not already have an account.
                        </li>
                        <li>
                            Download and install <a
                                href="https://www.ftrack.com/connect"
                                target="_blank"
                                onClick={onLinkClicked}
                            >ftrack Connect</a>.
                        </li>
                        <li>Launch Connect and sign in to your account.</li>
                    </ol>
                    <p>
                        For more information, see <a
                            href="https://ftrack.com/adobe"
                            target="_blank"
                            onClick={onLinkClicked}
                        >ftrack.com/adobe</a>.
                    </p>
                </div>

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
    onLinkClicked: React.PropTypes.func,
};

function mapDispatchToProps(dispatch) {
    return {
        onLinkClicked(event) {
            const href = event.target.href;
            dispatch(applicationOpenLink(href));
        },
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
