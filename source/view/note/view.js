
import React from 'react';
import { connect } from 'react-redux';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('view:note');

function Note({ data }) {
    logger.debug('Note item to render: ', data);
    return (
        <div>
            <div>{data.author.first_name}</div>
            <div>{data.content}</div>
        </div>
    );
}

Note.propTypes = {
    data: React.PropTypes.object.isRequired,
};


function NotesList({ items }) {
    logger.debug('Note items to render: ', items);
    return (
        <div>
            <div>Hello world!</div>
            {
                items.map((item) => <Note data={item} />)
            }
        </div>
    );
}

NotesList.propTypes = {
    items: React.PropTypes.object.isRequired,
};


const mapStateToProps = (state) => {
    const items = state.screen.notes && state.screen.notes.items || [];
    return {
        items,
    };
};

const NotesListView = connect(
    mapStateToProps,
    null
)(NotesList);

export default NotesListView;
