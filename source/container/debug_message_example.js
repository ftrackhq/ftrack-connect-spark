// :copyright: Copyright (c) 2016 ftrack

import { connect } from 'react-redux';
import { applicationDebugMessage } from 'action/application';
import Example from 'component/example';

function mapStateToProps(state) {
    return {
        user: state.user,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onButtonClicked(message) {
            dispatch(applicationDebugMessage(message));
        },
    };
}

const DebugMessageExample = connect(
    mapStateToProps,
    mapDispatchToProps
)(Example);

export default DebugMessageExample;
