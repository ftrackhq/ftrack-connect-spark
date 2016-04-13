// :copyright: Copyright (c) 2016 ftrack

import React from 'react';

import { User, PlaceholderUser } from 'component/user';
import { MenuItem } from 'react-toolbox/lib/menu';
import ButtonMenu from 'component/button_menu';
import FontIcon from 'react-toolbox/lib/font_icon';

import style from './style.scss';

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

export function DateField({ date }) {
    const className = date ? '' : style['empty-date'];
    let item;

    if (!date) {
        item = (
             <span className={className}>
                Due date
                <FontIcon className={style.icon} value="insert_invitation" />
            </span>
        );
    } else {
        item = <span>{date.toDate().toDateString()}</span>;
    }

    return (
        <div>{item}</div>
    );
}

DateField.propTypes = {
    date: React.PropTypes.object,
};

export function StatusField({ selected, statuses, onSelect }) {
    return (
        <ButtonMenu
            label={selected.name}
            className={style['status-field']}
            style={{ borderColor: selected.color }}
            onSelect={onSelect}
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
