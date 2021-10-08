const directories = require('../save_data/directories.json');
const chalk = require("chalk");
const wavefile = require('wavefile')
const menu = require('./menu');
const { execSync } = require('child_process');
var fs = require('fs-extra');

function UpdateConsole(Label, Progress, TotalTasks){
    console.clear();
    console.log(chalk.red.bold(`Building audio files...\nDon't close the program or alter any files!\n`));
    menu.ProgressBar(Label, Progress, TotalTasks);
}

function BuildFilesLoopless(WorkingDirectory, Target){
    //Run WaveConverter for a loopless bfstm with the selected file
    execSync(`${directories.PluginWaveConverter}/WaveConverter.exe --format bfstm --stream-prefetch --encoding adpcm ${WorkingDirectory}/project/AllUserContent/Sounds/${Target}`, (err, stdout, stderr) => {
        if (err) {
        console.log(chalk.red.bold(`WaveConverter Error!`));
        return;
        }
    });
    return;
}

function BuildFilesLoop(WorkingDirectory, Target, Start, End){
    //Run WaveConverter for a looping bfstm with the selected file
    execSync(`${directories.PluginWaveConverter}/WaveConverter.exe --format bfstm --loop-start=${Start} --loop-end=${End-2} --stream-prefetch --encoding adpcm ${WorkingDirectory}/project/AllUserContent/Sounds/${Target}`, (err, stdout, stderr) => {
        if (err) {
        console.log(chalk.red.bold(`WaveConverter Error!`));
        return;
        }
    });
}

function ProjectDataUpdate(WorkingDirectory, wavobj, Start, End){
    JSONObject = fs.readJSONSync(`${WorkingDirectory}/ProjectData.json`);

    if(!JSONObject.songs.hasOwnProperty(`${wavobj.target}`)){
        JSONObject.songs[wavobj.target] = {};
    }

    JSONObject.songs[wavobj.target].start = Start;
    JSONObject.songs[wavobj.target].end = End;

    fs.writeJSONSync(`${WorkingDirectory}/ProjectData.json`, JSONObject, {spaces: `\t`});
}

module.exports = {
    Main: function(WorkingDirectory, wavobj){
        console.clear();

        //Verify that the WaveConverter plugin exists
        if(!fs.existsSync(`${directories.PluginWaveConverter}/WaveConverter.exe`)){
            console.log(chalk.redBright.bold(`You need the WaveConverter plugin, a private addon not avaliable at this time`));
            return;
        }

        //Verify the selected TargetFile exists
        if(wavobj.target == `None`){
            console.log(chalk.red(`No file selected!`));
            return;
        }

        let TotalTasks;

        //No loop file processing
        if(wavobj.type == `No`){
            //Setup console
            TotalTasks = 3;

            //Build the bfstm
            UpdateConsole(`Building BFSTM & BFSTP...`, 0, TotalTasks);
            BuildFilesLoopless(WorkingDirectory, wavobj.target)

        } else if(wavobj.type == `Loops`){
            //Setup console
            TotalTasks = 3;

            //Build the bfstm
            UpdateConsole(`Building looping BFSTM & BFSTP...`, 0, TotalTasks);
            BuildFilesLoop(WorkingDirectory, wavobj.target, wavobj.start, wavobj.end);

        }

        //Move the output to the correct folders
        UpdateConsole(`Moving output to project/Sound/`, TotalTasks-2, TotalTasks);

        if(fs.existsSync(`${WorkingDirectory}/project/Sound/stream/${wavobj.target.slice(0, wavobj.target.length-4)}.bfstm`)){
            fs.removeSync(`${WorkingDirectory}/project/Sound/stream/${wavobj.target.slice(0, wavobj.target.length-4)}.bfstm`)
        }

        fs.moveSync(`${WorkingDirectory}/project/AllUserContent/Sounds/${wavobj.target.slice(0, wavobj.target.length-4)}.adpcm.bfstm`, `${WorkingDirectory}/project/Sound/stream/${wavobj.target.slice(0, wavobj.target.length-4)}.bfstm`);

        if(fs.existsSync(`${WorkingDirectory}/project/Sound/prefetch/${wavobj.target.slice(0, wavobj.target.length-4)}.bfstp`)){
            fs.removeSync(`${WorkingDirectory}/project/Sound/prefetch/${wavobj.target.slice(0, wavobj.target.length-4)}.bfstp`)
        }

        fs.moveSync(`${WorkingDirectory}/project/AllUserContent/Sounds/${wavobj.target.slice(0, wavobj.target.length-4)}.adpcm.bfstp`, `${WorkingDirectory}/project/Sound/prefetch/${wavobj.target.slice(0, wavobj.target.length-4)}.bfstp`);

        //Update ProjectData.json so future edits of this song can be faster
        UpdateConsole(`Updating your ProjectData.json`, TotalTasks-1, TotalTasks);

        if(wavobj.type != `No`){
            ProjectDataUpdate(WorkingDirectory, wavobj, wavobj.start, wavobj.end);
        }

        //Complete process
        UpdateConsole(`Complete!\nCheck project/Sound/stream and project/Sound/prefetch`, TotalTasks, TotalTasks);
        return;
    }
}