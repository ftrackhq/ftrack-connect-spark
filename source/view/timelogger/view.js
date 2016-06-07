// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import moment from 'moment';
import 'moment-duration-format';
import { connect } from 'react-redux';
import {
    timelogsLoadNextPage,
} from 'action/timelogger';
import EntityLink from 'component/entity_link';

import style from './style';

class TimelogItem extends React.Component {
    /** Render. */
    render() {
        const timelog = this.props.timelog;
        return (
            <div className="padding-small">
                <div style={{float: 'right'}}>
                    {moment.duration(timelog.duration, 'seconds').format('HH:mm:ss', {trim: false})}
                </div>
                <EntityLink
                    link={timelog.context.link}
                    parent={false}
                />

            </div>
        );
    }
}
/**

    * Return a header for timelogs. *
    renderBeforeTpl: function (values, xindex, xcount) {
        var start = moment(values.start).startOf('day'),
            html = '',
            previousDate = null,
            previousRecord = this.store.getAt(xindex-2);

        if (previousRecord) {
            previousDate = moment(previousRecord.get('start')).startOf('day');
        }

        if (previousDate === null || start < previousDate) {
            html = Ext.String.format(
                '<h4 class="timelogslist-header border-bottom">{0}</h4>',
                start.calendar().split(' at ')[0]
            );
        }
        return html;
    }
 */
function TimelogDateHeader({ timelog, previousTimelog }) {
    const start = moment(timelog.start);
    let shouldRenderHeader = true;
    if (previousTimelog) {
        const previousDate = moment(previousTimelog.start).startOf('day');
        shouldRenderHeader = start < previousDate;
    }
    console.info('TimelogDateHeader', previousTimelog, shouldRenderHeader)
    return (shouldRenderHeader) ? (
        <h5 className="padding-small">
            {start.calendar().split(' at ')[0]}
        </h5>
    ) : null;
}

/** Versions. */
class TimeloggerView extends React.Component {

    /** Constructor. */
    constructor() {
        super();
    }


    /** Render. */
    render() {
        return (
            <div className="padding-normal">
                <h4 className="padding-small">Time logger</h4>
                <ul>
                    {this.props.items.reduce(
                        (accumulator, item, index, items) => {
                            const previousTimelog = index && items[index - 1] || null;
                            return [
                                ...accumulator,
                                <TimelogDateHeader key={`header-${item.id}`} timelog={item} previousTimelog={previousTimelog} />,
                                <TimelogItem key={item.id} timelog={item} />,
                            ];
                        }, []
                    )}
                </ul>
            </div>
        );
    }
}

TimeloggerView.propTypes = {
    items: React.PropTypes.array.isRequired,
};

/** Map version state to components */
function mapStateToProps(state) {
    return {
        items: state.screen.timelogger && state.screen.timelogger.items || [],
    };
}

/** Map import actions to props */
function mapDispatchToProps(dispatch) {
    return {
        onFetchMore(entity, nextOffset) {
            dispatch(timelogsLoadNextPage(nextOffset));
        },
    };
}

TimeloggerView = connect(
    mapStateToProps,
    mapDispatchToProps
)(TimeloggerView);

export default TimeloggerView;
