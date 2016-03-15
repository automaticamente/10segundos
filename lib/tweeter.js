/*jshint camelcase: false */

'use strict';

const Twit = require('twit');

class Tweeter {
    constructor(api) {
        this.twitter = new Twit(api);
    }

    tweet(text) {
        return new Promise((resolve, reject) => {
            this.twitter.post('statuses/update', {
                status: text
            }, function(error, data) {
                if (error) {
                    reject(error);
                }

                resolve(data.id_str);
            });
        });
    }

    tweetVideo(text, file) {

        return new Promise((resolve, reject) => {
            this.twitter.postMediaChunked({
                file_path: file
            }, (error, data) => {
                if (error) {
                    reject(error);
                }

                var params = {
                    status: text,
                    media_ids: [data.media_id_string]
                };

                this.twitter.post('statuses/update', params, function(error, data) {
                    if (error) {
                        reject(error);
                    }

                    resolve(data.id_str);
                });
            });

        });
    }
}

module.exports = Tweeter;