// :copyright: Copyright (c) 2016 ftrack
/* global window */

const getStoragePrefix = () => 'ftrack-connect-spark/';

const getKey = (key) => `${getStoragePrefix()}${key}`;

export const getState = (key, defaultValue = null) => {
    try {
        const serializedState = window.localStorage.getItem(getKey(key));
        const state = JSON.parse(serializedState);
        return (state !== null) ? state : defaultValue;
    } catch (error) {
        return defaultValue;
    }
};

export const saveState = (key, state) => {
    try {
        const serializedState = JSON.stringify(state);
        window.localStorage.setItem(getKey(key), serializedState);
        return true;
    } catch (error) {
        return false;
    }
};

export default {
    getState,
    saveState,
};
