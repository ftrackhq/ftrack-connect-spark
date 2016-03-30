import React from 'react';

import { IconButton } from 'react-toolbox';
import { browserHistory } from 'react-router';
import Header from 'component/header';

/** Go back. */
const navigateBack = () => {
    browserHistory.goBack();
};

const rightButton = <IconButton icon="close" onClick={navigateBack} />;

function ClosableHeader(props) {
    return <Header rightButton={rightButton} {...props} />;
}

export default ClosableHeader;
