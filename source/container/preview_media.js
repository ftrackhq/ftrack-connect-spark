
import { connect } from 'react-redux';
import { download, hidePreviewMedia, changeActive } from 'action/preview_media';
import PreviewMedia from 'component/preview_media';

function mapStateToProps(state) {
    const previewMediaState = state.screen.preview_media || {};
    return previewMediaState;
}

function mapDispatchToProps(dispatch) {
    return {
        onDownload: (componentId) => dispatch(download(componentId)),
        onDismiss: () => dispatch(hidePreviewMedia()),
        onChange: (index) => dispatch(changeActive(index)),
    };
}

const PreviewMediaContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(PreviewMedia);

export default PreviewMediaContainer;
