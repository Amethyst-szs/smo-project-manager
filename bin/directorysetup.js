var fs = require('fs-extra');
const chalk = require("chalk");
const jsonfile = require('jsonfile');

module.exports = {
    CreateFile: function(OwnDirectory){
        directoriesDefault = {
            "EditorCore": "",
            "SMODirectory": "",
            "Optional": {
                "ObjectDataOverride": "",
                "LocalizedDataOverride": ""
            }
        }
        jsonfile.writeFileSync(OwnDirectory+'save_data/directories.json', directoriesDefault);
        return;
    },
    
    IssuesCheck: function(OwnDirectory){
        Directories = require('../save_data/directories.json');

        //Check if EditorCore directory is invalid
        if(!fs.existsSync(Directories.EditorCore+`/EditorCore.exe`)){
            console.log(chalk.red.bold(`EditorCore directory invalid!\nMake sure this folder contains EditorCore.exe and make sure the directories.json path doesn't end in a slash`));
            return true;
        }

        //Check if SMODirectory is invalid
        if(!fs.existsSync(Directories.SMODirectory+`/EffectData/EffectDataBase.szs`)){
            console.log(chalk.red.bold(`SMO dump directory invalid!\nMake sure this folder contains the "Data" folders and make sure the directories.json path doesn't end in a slash`));
            return true;
        }

        //Make sure that the ObjectDataOverride and LocalizedDataOverride values exist, but they aren't required
        if(!Directories.hasOwnProperty('Optional')){
            console.log(chalk.red.bold(`Your directories file is outdated. Check if anything needs to be added.`));
            Directories.Optional = {
                "ObjectDataOverride": "",
                "LocalizedDataOverride": ""
            }
            fs.writeJsonSync(OwnDirectory+'save_data/directories.json', Directories);
            return true;
        }
        
        //If the property PluginWaveConverter doesn't exist, add it
        if(!Directories.hasOwnProperty('PluginWaveConverter')){
            console.log(chalk.red.bold(`Your directories file is outdated. Check if anything needs to be added.`));
            Directories.PluginWaveConverter = "";
            fs.writeJsonSync(OwnDirectory+'save_data/directories.json', Directories);
            return true;
        }

        return false;
    }
}