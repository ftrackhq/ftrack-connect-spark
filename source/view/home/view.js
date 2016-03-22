// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Link } from 'react-router';

import style from './style.scss';


/** Home view */
function HomeView() {
    return (
        <div className={style.home}>
            <h2>ftrack connect spark</h2>
            <p><Link to="/example">To example view</Link></p>
            <p><Link to="/context/projects/context">Browse</Link></p>
        </div>
    );
}

export default HomeView;
