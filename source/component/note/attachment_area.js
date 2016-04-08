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
function AttachmentArea({ components }) {
    const images = [];
    const other = [];

    components.forEach(
        component => {
            if (
                SUPPORTED_IMG_FILE_TYPES.includes(
                    component.file_type.slice(1).toLowerCase()
                )
            ) {
                images.push(<img key={component.id} src={session.thumbnail(component.id, 100)} />);
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
};

export default AttachmentArea;
