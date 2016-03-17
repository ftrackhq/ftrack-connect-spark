// :copyright: Copyright (c) 2016 ftrack

import loglevel from 'loglevel';
const logger = loglevel.getLogger('main:mediator');

/** Return promise which is resolved after *ms* delay. */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Return promise which is resolved with *result* after a random delay.
 *
 * *min* and *max* should be specified in milliseconds.
 */
export function delayedResponse(result, min = 500, max = 750) {
    const timeout = min + (max - min) * Math.random();
    const promise = new Promise((resolve) => {
        delay(timeout).then(resolve(result));
    });
    return promise;
}

/**
 * Main Mediator
 *
 * Used for development purposes only.
 */
export class MainMediator {

    getPublishOptions() {
        logger.info('[MainMediator]', 'Get publish options');
        return delayedResponse({
            name: 'image',
        });
    }

    exportReviewableMedia(options) {
        logger.info('[MainMediator]', 'Exporting media', options);
        return delayedResponse([{
            name: 'image',
            path: '/Users/Shared/ftrack/media/image.jpg',
            extension: '.jpg',
            size: 10403354,
        }]);
    }

    uploadMedia(options) {
        logger.info('[MainMediator]', 'Uploading media', options);
        return delayedResponse(true);
    }
}

/** Export *MainMediator* instance. */
const mainMediator = new MainMediator();
export default mainMediator;
