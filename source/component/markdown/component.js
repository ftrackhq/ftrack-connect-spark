// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import MarkdownIt from 'markdown-it';
import PropTypes from 'prop-types';

const markdown = new MarkdownIt('commonmark');

/** Render markdown from *source*. */
export default function Markdown({ source }) {
    const html = {
        __html: markdown.render(source || ''),
    };

    return <span dangerouslySetInnerHTML={html} />;
}

Markdown.propTypes = {
    source: PropTypes.string.isRequired,
};
