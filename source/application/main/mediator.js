
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function randomDelay(min, max) {
    const timeout = min + (max - min) * Math.random();
    return delay(timeout);
}

export class WebMediator {
    uploadMedia(options) {
        console.info('[WebMediator]', 'Uploading media', options);
        return randomDelay(200, 600);
    }
}

const webMediator = new WebMediator();

export default webMediator;
