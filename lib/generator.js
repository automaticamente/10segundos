'use strict';

const spawn = require('child_process').spawn;
const moment = require('moment');

const rtmpServer = 'rtmp://media1.crtvg.es:80/voq/';

module.exports = {
    duration: (stream) => {
        return new Promise((resolve, reject) => {
            const url = rtmpServer + stream;

            let ffmpegProcess;
            let output = [];

            const args = ['-i', url];

            try {
                ffmpegProcess = spawn('ffprobe', args);
            } catch (error) {
                return reject(error);
            }

            ffmpegProcess.on('error', (error) => {
                return reject(error);
            });

            ffmpegProcess.stderr.on('data', (data) => {
                output.push(data.toString());
            });


            ffmpegProcess.on('close', (code, signal) => {
                if (code !== 0) {
                    return reject(new Error('fuck!'));
                } else {
                    const duration = output.join('').match(/Duration: (\d+:\d+:\d+)/);

                    if (duration) {
                        return resolve({
                            stream,
                            duration: moment.duration(duration[1], 'HH:mm:ss').asSeconds()
                        });
                    } else {
                        return reject('Duration not found');
                    }
                }
            });
        });
    },
    cut: (stream, start, year, font, output) => {
        return new Promise((resolve, reject) => {
            const url = rtmpServer + stream;

            let ffmpegProcess;

            const args = [
                '-v', 'quiet',
                '-y',
                '-ss', start,
                '-i', url,
                '-t', 11,
                '-vf', `fade=out:st=10:d=1,drawtext=fontfile=${font}:text='Imaxes © ${year} CRTVG':y=main_h-(text_h*2):x=(main_w/2-text_w/2):fontcolor=white:alpha=0.7:fontsize=12`,
                '-af', 'afade=in:st=0:d=1,afade=out:st=10:d=1',
                '-c:v', 'libx264',
                output
            ];

            try {
                ffmpegProcess = spawn('ffmpeg', args);
            } catch (error) {
                return reject(error);
            }

            ffmpegProcess.on('error', function(error) {
                return reject(error);
            });

            ffmpegProcess.on('close', function(code, signal) {
                if (code !== 0) {
                    return reject(new Error('fuck!'));
                } else {
                    return resolve(output);
                }
            });
        });
    }
};
