// :copyright: Copyright (c) 2016 ftrack

import { connect } from 'react-redux';
import { applicationDebugMessage } from 'action/application';
import Example from 'component/example';

console.info(applicationDebugMessage);

function mapDispatchToProps(dispatch) {
    return {
        onButtonClicked(message) {
            console.info('DebugMessageExample::onClick');
            dispatch(applicationDebugMessage(message));
        },
    };
}

const DebugMessageExample = connect(
  null,
  mapDispatchToProps
)(Example);

export default DebugMessageExample;
