// :copyright: Copyright (c) 2016 ftrack

import { connect } from 'react-redux';
import { hashHistory } from 'react-router';
import ContextBrowser from 'container/context_browser';
import { publishResolveContext } from 'action/publish';

function mapStateToProps() {
    return {
        disableRootBack: false,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onRootBack() {
            hashHistory.goBack();
        },
        onSelectContext(id) {
            hashHistory.goBack();
            dispatch(
                publishResolveContext(id)
            );
        },
    };
}

const PublishContextBrowser = connect(
    mapStateToProps, mapDispatchToProps
)(ContextBrowser);

export default PublishContextBrowser;
