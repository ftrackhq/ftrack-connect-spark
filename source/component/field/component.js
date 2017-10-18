// :copyright: Copyright (c) 2016 ftrack

import React from 'react';

import { User, PlaceholderUser } from 'component/user';
import { MenuItem } from 'react-toolbox/lib/menu';
import ButtonMenu from 'component/button_menu';
import FontIcon from 'react-toolbox/lib/font_icon';

import style from './style.scss';

/** Assignee field to display assignees or an unassigned placeholder. */
export function AssigneeField({ assignees, loading }) {
    if (loading === true || assignees.length === 0) {
        return (
            <PlaceholderUser
                title={
                    loading ? '' : 'Unassigned'
                }
            />
        );
    }

    const primary = <User data={assignees[0]} thumbnail />;
    const names = assignees.map(
        (user) => `${user.first_name} ${user.last_name}`
    );

    return (
        <div className={style.assignees} title={`${names.join(', ')}`}>
            {primary}
            {
                assignees.length > 1 ?
                (
                    <span className={style.additional}>
                        {`+${assignees.length - 1}`}
                    </span>
                ) : ''
            }
        </div>
    );
}

AssigneeField.propTypes = {
    assignees: React.PropTypes.array.isRequired,
    loading: React.PropTypes.bool,
};

/** Date field to display a date or an empty string. */
export function DateField({ date }) {
    const text = date ? date.toDate().toDateString() : 'No due date';

    return (
        <div className={style.date}>
            <FontIcon className={style.icon} value="insert_invitation" />
            {text}
        </div>
    );
}

DateField.propTypes = {
    date: React.PropTypes.object,
};

/** Status field to display a status and allow selection of statuses. */
export function StatusField({ selected, statuses, onSelect }) {
    return (
        <ButtonMenu
            className={style['status-field-wrapper']}
            onSelect={onSelect}
            position="topLeft"
            button={
                <div className={style['status-field']}>
                    <span
                        className={style['status-field-inner']}
                        style={{ borderColor: selected.color }}
                    >
                        {selected.name}
                    </span>
                </div>
            }
        >
            {
                statuses.map(
                    (status) => <MenuItem caption={status.name} key={status.id} value={status.id} />
                )
            }
        </ButtonMenu>
    );
}

StatusField.propTypes = {
    selected: React.PropTypes.object,
    statuses: React.PropTypes.array,
    onSelect: React.PropTypes.func,
};
