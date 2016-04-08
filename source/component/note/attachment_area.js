// :copyright: Copyright (c) 2016 ftrack

import React from 'react';

import style from './style.scss';
import { session } from '../../ftrack_api';

// Components file a file type in this list will be displayed using an img
// element.
const SUPPORTED_IMG_FILE_TYPES = [
    'png', 'gif', 'jpeg', 'jpg', 'bmp', 'tif', 'tiff',
];

/** Attachment area component to display an array of *components*. */
function AttachmentArea({ components, onAttachmentClick }) {
    const images = [];
    const mediaComponents = [];
    const other = [];

    components.forEach(
        component => {
            if (
                SUPPORTED_IMG_FILE_TYPES.includes(
                    component.file_type.slice(1).toLowerCase()
                )
            ) {
                mediaComponents.push(
                    component
                );
                images.push(
                    <div
                        key={component.id}
                        onClick={
                            function() {
                                onAttachmentClick(
                                    component.id,
                                    mediaComponents
                                );
                            }
                        }
                        className={style.image}
                        style={{
                            backgroundImage: `url('${session.thumbnail(component.id, 400)}')`
                        }}
                    />);
            } else {
                other.push(
                    <p key={component.id}>{`${component.name}${component.file_type}`}</p>
                );
            }
        }
    );

    return (
        <div className={style['attachments-area']}>
            <div className={style.images}>
                {images}
            </div>
            <div className={style.other}>
                {other}
            </div>
        </div>
    );
}

AttachmentArea.propTypes = {
    components: React.PropTypes.array.isRequired,
    onAttachmentClick: React.PropTypes.func,
};

export default AttachmentArea;
