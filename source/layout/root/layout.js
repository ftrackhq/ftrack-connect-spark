// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Layout, Panel } from 'react-toolbox/lib/layout';
import PropTypes from 'prop-types';

import ApplicationOverlay from 'container/application_overlay';
import PreviewMediaContainer from 'container/preview_media';
import ApplicationSnackbar from 'container/application_snackbar';

// Include global application styles
import 'react-toolbox/components/commons.scss';
import style from './style.scss';

/** A root layout. */
function RootLayout({ children }) {
    return (
        <Layout>
            <Panel scrollY className={style.panel}>
                {children}
                <ApplicationOverlay />
                <PreviewMediaContainer />
                <ApplicationSnackbar />
            </Panel>
        </Layout>
    );
}

RootLayout.propTypes = {
    children: PropTypes.element,
};

export default RootLayout;
