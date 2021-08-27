const directories = require('../save_data/directories.json');
const chalk = require("chalk");
const wavefile = require('wavefile')
const menu = require('./menu');
var fs = require('fs-extra');

module.exports = {
    Main: async function(WorkingDirectory, TargetFile){
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
        let EndLoopPoint = 1;
        let CurrentSamplePoint = 0;
        let Samples = [];
        let isSearchingLoop = true;

        //Read thie TargetFile and return a buffer
        fs.stat(`${WorkingDirectory}/project/AllUserContent/Sounds/${TargetFile}`, function(err, stats) {
            fs.open(`${WorkingDirectory}/project/AllUserContent/Sounds/${TargetFile}`, 'r', function(errOpen, fd) {
                fs.read(fd, Buffer.alloc(stats.size), 0, stats.size, 0, function(errRead, bytesRead, buffer) {
                    //Get the samples
                    wav = new wavefile.WaveFile();
                    wav.fromBuffer(buffer);
                    Samples = wav.getSamples()[0];
                    Samples = Samples.toString();
                    console.log(chalk.green.bold(`Loaded .wav file! Processing file...`));
                    console.log(Samples);

                    //Start searching for loop timings
                    while(isSearchingLoop){
                        TestGround = Samples.slice(CurrentSamplePoint, CurrentSamplePoint+999);
                        let Testa = new Float64Array;
                        let Tests = new String;
                        FoundRepeat = Samples.slice(CurrentSamplePoint+1000, Samples.length).includes(TestGround);
                        console.log(FoundRepeat, CurrentSamplePoint, Samples.length, Samples.slice(CurrentSamplePoint+1000, Samples.length).length);
                        CurrentSamplePoint += 1000;
                        if(FoundRepeat) { isSearchingLoop=false };
                        if(CurrentSamplePoint > Samples.length) { isSearchingLoop=false }; 
                    }

                });
            });
        });
    }
}