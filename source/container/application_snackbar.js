// :copyright: Copyright (c) 2016 ftrack

import { connect } from 'react-redux';
import { notificationHide } from 'action/notification';
import Snackbar from 'react-toolbox/lib/snackbar';

/** Return Snackbar props from state. */
function mapStateToProps(state) {
    return state.screen.notification;
}

/** Return Snackbar props for hiding notification. */
function mapDispatchToProps(dispatch) {
    return {
        onTimeout() {
            dispatch(notificationHide());
        },
        onClick() {
            dispatch(notificationHide());
        },
    };
}

const ApplicationSnackbar = connect(
    mapStateToProps, mapDispatchToProps
)(Snackbar);

export default ApplicationSnackbar;
