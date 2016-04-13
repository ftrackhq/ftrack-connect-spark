// :copyright: Copyright (c) 2016 ftrack

import React from 'react';

import { User, PlaceholderUser } from 'component/user';
import { MenuItem } from 'react-toolbox/lib/menu';
import ButtonMenu from 'component/button_menu';
import FontIcon from 'react-toolbox/lib/font_icon';

import style from './style.scss';

/** Assignee field to display assignees or an unassigned placeholder. */
export function AssigneeField({ assignees }) {
    if (assignees.length === 0) {
        return (
            <div>
                <PlaceholderUser title="Unassigned" />
            </div>
        );
    }

    return (
        <div>
            {
                assignees.map(
                    asignee => <User data={asignee.resource} thumbnail />
                )
            }
        </div>
    );
}

AssigneeField.propTypes = {
    assignees: React.PropTypes.array.isRequired,
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
            onSelect={onSelect}
            button={
                <span
                    className={style['status-field']}
                    style={{ borderColor: selected.color }}
                >
                    {selected.name}
                </span>
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
