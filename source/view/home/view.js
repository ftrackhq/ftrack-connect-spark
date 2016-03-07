// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Link } from 'react-router';

import style from './style.scss';


/** Home view */
class HomeView extends React.Component {
    render() {
        return (
            <div className={style.home}>
                <h2>ftrack connect spark</h2>
                <p><Link to="/example">To example view</Link></p>
            </div>
        );
    }
}

export default HomeView;
