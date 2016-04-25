// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import HomeHeader from 'container/home_header';
import RouteTabs from 'container/route_tabs';

import style from './style.scss';

/** Home view */

function HomeView({ children }) {
    const tabs = [
        { route: 'my-tasks', label: 'My tasks' },
        { route: 'browse-all', label: 'Browse all' },
    ];
    return (
        <div className={style.root}>
            <HomeHeader />
            <div className={style.tabs}>
                <RouteTabs items={tabs} baseRoute="/home/" />
            </div>
            {children}
        </div>
    );
}

HomeView.propTypes = {
    children: React.PropTypes.element.isRequired,
};

export default HomeView;
