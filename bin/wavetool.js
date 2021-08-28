const directories = require('../save_data/directories.json');
const chalk = require("chalk");
const wavefile = require('wavefile')
const menu = require('./menu');
var fs = require('fs-extra');

module.exports = {
    Main: function(WorkingDirectory, TargetFile){
        // console.clear();

        //Verify that the WaveConverter plugin exists
        if(!fs.existsSync(`${directories.PluginWaveConverter}/WaveConverter.exe`)){
            console.log(chalk.redBright.bold(`You need the WaveConverter plugin, a private addon not avaliable at this time`));
            return;
        }

        //Verify the selected TargetFile exists
        if(TargetFile == `None`){
            console.log(chalk.red(`No file selected!`));
            return;
        }

        //Setup variables
        let StartLoopPoint = 0;
        let EndLoopPoint = 0;
        let CurrentSamplePoint = 264000;
        let Samples = [];
        let SongLength = 0;
        let isSearchingLoop = true;

        //Read thie TargetFile and return a buffer
        fs.stat(`${WorkingDirectory}/project/AllUserContent/Sounds/${TargetFile}`, function(err, stats) {
            fs.open(`${WorkingDirectory}/project/AllUserContent/Sounds/${TargetFile}`, 'r', function(errOpen, fd) {
                fs.read(fd, Buffer.alloc(stats.size), 0, stats.size, 0, function(errRead, bytesRead, buffer) {
                    //Get the samples
                    wav = new wavefile.WaveFile();
                    wav.fromBuffer(buffer);
                    Samples = wav.getSamples()[0];
                    SongLength = Samples.length;
                    console.log(chalk.green.bold(`Loaded .wav file! Processing file...`));

                    //Start searching for loop timings
                    let s = new Set();

                    let Segment = [];

                    let blockSize = 20;

                    for (let i = 0; i < SongLength; i++) {
                        let sl = Samples.slice(i, i + blockSize);
                        if (sl.length < blockSize) {
                            break;
                        }
                        let x = sl.join(',');
                        if (s.has(x)) {
                            console.log(chalk.green.bold.underline(`Success`));
                            console.log(i);
                            console.log('S: ', [...s]);
                            break;
                        }
                        Segment.push(Samples[i]);
                        s.add(x);
                    }

                    console.log("Found it: ", Segment);

                });
            });
        });
    }
}