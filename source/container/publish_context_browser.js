// :copyright: Copyright (c) 2016 ftrack

import { connect } from 'react-redux';
import { hashHistory } from 'react-router';
import ContextBrowser from 'container/context_browser';


function mapStateToProps() {
    return {
        disableRootBack: false,
    };
}

function mapDispatchToProps() {
    return {
        onRootBack() {
            hashHistory.goBack();
        },
        onSelectContext(id) {
            hashHistory.goBack();
            // HACK look like goBack is async and replace is sync, so delay it
            setTimeout(() => hashHistory.replace(`/publish/${id}`), 0);
        },
    };
}

const PublishContextBrowser = connect(
    mapStateToProps, mapDispatchToProps
)(ContextBrowser);

export default PublishContextBrowser;
