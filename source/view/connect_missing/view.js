// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { connect } from 'react-redux';
import FontIcon from 'react-toolbox/lib/font_icon';
import Button from 'react-toolbox/lib/button';

import { applicationAuthenticate } from 'action/application';
import style from './style.scss';


/** Connect missing view. */
function _ConnectMissingView({ onRetryClicked }) {
    return (
        <div className={style.view}>
            <FontIcon value="cloud_off" className={style.icon} />
            <h6>
                You don't seem to have <a href="https://www.ftrack.com/portfolio/connect" target="_blank">ftrack Connect</a> installed.
                <br />
                Connect is required to communicate with ftrack.
            </h6>
            <Button
                label="Retry"
                raised
                primary
                onClick={onRetryClicked}
            />
        </div>
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
