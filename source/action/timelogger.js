// :copyright: Copyright (c) 2016 ftrack

const TIMELOGS_LOAD = 'TIMELOGS_LOAD';
const TIMELOGS_LOADED = 'TIMELOGS_LOADED';


/** Load next page of timelogs action creator. */
export function timelogsLoad(nextOffset = null) {
    return {
        type: TIMELOGS_LOAD,
        payload: {
            nextOffset,
        },
    };
}

/** timelogs loaded action creator. */
export function timelogsLoaded(timelogs, nextOffset) {
    return {
        type: TIMELOGS_LOADED,
        payload: {
            items: timelogs,
            nextOffset,
        },
    };
}


export default {
    TIMELOGS_LOAD,
    TIMELOGS_LOADED,
};
