// :copyright: Copyright (c) 2016 ftrack

import { connect } from 'react-redux';
import { hashHistory } from 'react-router';
import ContextBrowser from 'container/context_browser';
import { publishResolveContext } from 'action/publish';

function mapDispatchToProps(dispatch) {
    return {
        onSelectContext(id) {
            hashHistory.goBack();
            dispatch(
                publishResolveContext(id)
            );
        },
    };
}

const PublishContextBrowser = connect(null, mapDispatchToProps)(ContextBrowser);

export default PublishContextBrowser;
