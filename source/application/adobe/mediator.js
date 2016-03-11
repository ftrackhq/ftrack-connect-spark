

export class AdobeMediator {
    exportReviewableMedia(options) {
        const exporter = window.top.FT.exporter;
        console.info('[AdobeMediator]', '<-[export]-', options);

        const promise = new Promise((resolve, reject) => {
            exporter.exportReviewableMedia(options, (error, response) => {
                console.info('[AdobeMediator]', '-[export]->', error, response);
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });

        return promise;
    }

    uploadMedia({ path, url, headers }) {
        const uploader = window.top.FT.uploader;

        console.info(
            '[AdobeMediator]', 'Uploading media',
            Object.keys(uploader)[0], uploader.uploadMedia
        );

        const promise = new Promise((resolve, reject) => {
            uploader.uploadFile(path, url, headers, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });

        return promise;
    }
}

const adobeMediator = new AdobeMediator();

export default adobeMediator;
