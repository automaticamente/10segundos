'use strict';
const request = require('request');

module.exports = (url) => {
    return new Promise((resolve, reject) => {
        request({
            url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 7.0; InfoPath.3; .NET CLR 3.1.40767; Trident/6.0; en-IN)'
            }
        }, function(error, response, body) {
            if (error || response.statusCode !== 200) {
                return reject(error, response);
            }

            return resolve(body);
        });
    });
};