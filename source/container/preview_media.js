
import React from 'react';
import { connect } from 'react-redux';

import { hidePreviewMedia } from 'action/preview_media';
import { PreviewMedia, PreviewImage } from 'component/preview_media';
import { session } from '../ftrack_api';

/** Preview media component used to preview media components. */
function PreviewMediaComponents(props) {
    const { components, visible, index, onDismiss, onDownload } = props;

    if (!visible) {
        return <noscript />;
    }

    return (
        <PreviewMedia
            onDismiss={onDismiss}
            onDownload={onDownload}
            defaultIndex={index}
        >
        {
            components.map(
                component => (
                    <PreviewImage
                        key={component.id}
                        url={session.thumbnail(component.id, 2048)}
                        name={`${component.name}${component.file_type}`}
                        downloadUrl={session.getComponent(component.id)}
                    />
                )
            )
        }
        </PreviewMedia>
    );
}

PreviewMediaComponents.propTypes = {
    components: React.PropTypes.arrayOf(
        React.PropTypes.shape({
            id: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired,
            file_type: React.PropTypes.string.isRequired,
        })
    ),
    index: React.PropTypes.number,
    visible: React.PropTypes.bool,
    onDismiss: React.PropTypes.func.isRequired,
    onDownload: React.PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const previewMediaState = state.screen.preview_media || {};
    return previewMediaState;
}

function mapDispatchToProps(dispatch) {
    return {
        onDownload: (downloadUrl) => {
            window.location = downloadUrl;
        },
        onDismiss: () => dispatch(hidePreviewMedia()),
    };
}

const PreviewMediaContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(PreviewMediaComponents);

export default PreviewMediaContainer;
