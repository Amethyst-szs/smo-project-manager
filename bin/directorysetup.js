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
            },
            "PluginWaveConverter": ""
        }
        jsonfile.writeFileSync(OwnDirectory+'save_data/directories.json', directoriesDefault, {spaces: `\t`});
        return;
    },
    
    IssuesCheck: function(OwnDirectory){
        Directories = require('../save_data/directories.json');

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
            fs.writeJSONSync(OwnDirectory+'save_data/directories.json', Directories, {spaces: `\t`});
            return true;
        }
        
        //If the property PluginWaveConverter doesn't exist, add it
        if(!Directories.hasOwnProperty('PluginWaveConverter')){
            console.log(chalk.red.bold(`Your directories file is outdated. Check if anything needs to be added.`));
            Directories.PluginWaveConverter = "";
            fs.writeJSONSync(OwnDirectory+'save_data/directories.json', Directories, {spaces: `\t`});
            return true;
        }

        return false;
    },

    WavPluginCheck: function(){
        Directories = require('../save_data/directories.json');
        if(fs.existsSync(`${Directories.PluginWaveConverter}/WaveConverter.exe`)){
            return true;
        }
        return false;
    },

    EditorCoreCheck: function(){
        Directories = require('../save_data/directories.json');
        if(fs.existsSync(`${Directories.EditorCore}/EditorCore.exe`)){
            return true;
        }
        return false;
    }
}