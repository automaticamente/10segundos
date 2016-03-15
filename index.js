'use strict';

const fs = require('fs');
const path = require('path');
const moment = require('moment');
const cheerio = require('cheerio');
const _ = require('lodash');

const feeder = require('./lib/feeder');
const generator = require('./lib/generator');
const Tweeter = require('./lib/tweeter');

const config = fs.existsSync('./local.config.js') ?
    require('./local.config.js') :
    require('./config.js');

const baseUrl = 'http://pasouoquepasou.crtvg.es';

const T = new Tweeter(config.twitterAPI);

const bot = () => {
    const url = `${baseUrl}/novidades?page=${_.random(0, 128)}`;
    const videoData = new Map();

    feeder(url)
        .then(body => {
            const $ = cheerio.load(body);

            const links = $('.view-content h3 a').map((i, el) => baseUrl + $(el).attr('href')).get();
            return _.sample(links);
        })
        .then(link => {
            videoData.set('link', link);
            return feeder(link);
        })
        .then(body => {
            const $ = cheerio.load(body);

            videoData.set('title', $('.views-field-title').text().trim());
            videoData.set('date', moment($('.date-display-single').text(), 'DD/MM/YYYY'));

            const data = body.match(/"rtmp","url":"(.*)","autoPlay"/);

            if(!data) {
                throw new Error('Stream not found');
            }

            return data[1].replace(/\\/g, '');
        })
        .then(stream => generator.duration(stream))
        .then(result => generator.cut(result.stream, _.random(0, result.duration - 11), videoData.get('date').year(), config.font, path.join(__dirname, 'current.mp4')))
        .then(output => T.tweetVideo(`${videoData.get('title')} ${videoData.get('link')}`, output))
        .then(id => process.stdout.write(id))
        .catch(error => console.error(error));
};

bot();