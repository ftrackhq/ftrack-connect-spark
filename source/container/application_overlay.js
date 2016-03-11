// :copyright: Copyright (c) 2016 ftrack

import { connect } from 'react-redux';
import Overlay from 'component/overlay';
import { overlayHide } from 'action/overlay';


/** Return overlay configuration. */
function selectOverlay(state) {
    return state.screen.overlay || {};
}

function mapDispatchToProps(dispatch) {
    return {
        onDismss() {
            dispatch(overlayHide());
        },
    };
}

const ApplicationOverlay = connect(selectOverlay, mapDispatchToProps)(Overlay);

export default ApplicationOverlay;
