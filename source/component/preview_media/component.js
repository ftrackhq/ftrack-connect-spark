
import React from 'react';
import { IconButton } from 'react-toolbox';

import style from './style';
import Header from 'component/header';

function PreviewMedia({ components, visible, index, onDismiss, onDownload, onChange }) {
    const closeButton = <IconButton icon="close" onClick={onDismiss} />;

    if (!visible) {
        return null;
    }

    const handleChange = (index) => {
        let adjustedIndex = index;

        if (adjustedIndex < 0) {
            adjustedIndex = components.length - 1;
        }

        if (adjustedIndex > components.length - 1) {
            adjustedIndex = 0;
        }

        onChange(adjustedIndex);
    }

    const centerItems = (
        <div className={style['media-control']}>
            <span
                className={style['control-button']}
                onClick={handleChange.bind(this, index - 1)}
            >&#10094;</span>
            {`${index + 1} of ${components.length}`}
            <span
                className={style['control-button']}
                onClick={handleChange.bind(this, index + 1)}
            >&#10095;</span>
        </div>
    );

    const component = components[index];

    return (
        <div className={style['preview-media']}>
            <Header
                className={style.header}
                title={`${component.name}${component.file_type}`}
                rightButton={closeButton}
                centerItems={centerItems}
            />
            {index}
        </div>
    );
}

PreviewMedia.propTypes = {
    components: React.PropTypes.array,
    index: React.PropTypes.number,
    visible: React.PropTypes.bool,
    onDismiss: React.PropTypes.func.isRequired,
    onDownload: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
};

PreviewMedia.defaultProps = {
    components: [{
        id: 'a',
        name: 'file1',
        file_type: '.jpeg',
    }, {
        id: 'b',
        name: 'another',
        file_type: '.png',
    }, {
        id: 'c',
        name: 'yes',
        file_type: '.png',
    }],
    index: 0,
    visible: true,
};

export default PreviewMedia;
