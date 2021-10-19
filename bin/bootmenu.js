const input = require("input");
const chalk = require("chalk");
const boxen = require('boxen');
var fs = require('fs-extra');

async function DirectoryInputSafetyCheck(TextString){
    console.log(TextString[TextString.length-1]);
    if(TextString[TextString.length-1] == '\\' || TextString[TextString.length-1] == '/'){
        return TextString.slice(0, TextString.length-1);
    } else {
        return TextString;
    }
}

module.exports = {
    MainSelection: async function(FunctionalDirectories){
        MenuChoices = [];
        if(!FunctionalDirectories){
            MenuChoices = [
            `Edit Directories`,
            `Quit`];
        } else {
            MenuChoices = [
            `Create New Project`,
            `Load Project`,
            `Edit Directories`,
            `Quit`];
        }

        return await input.select(`Boot Menu:`, MenuChoices);
    },

    DirectorySetupMenu: async function(directories){
        //List of settings avaliable
        Options = [`SMODirectory - ${directories.SMODirectory}`, `EditorCore* - ${directories.EditorCore}`,
        `ObjectDataOverride* - ${directories.Optional.ObjectDataOverride}`, `LocalizedDataOverride* - ${directories.Optional.LocalizedDataOverride}`,
        `PluginWaveConverter* - ${directories.PluginWaveConverter}`, `YuzuDirectory* - ${directories.YuzuDirectory}`];
        SettingPointers = [`EditorCore`, `SMODirectory`, `ObjectDataOverride`, `LocalizedDataOverride`, `PluginWaveConverter`, `YuzuDirectory`];
        
        console.clear();
        console.log(chalk.cyanBright(`Directory Editor`));
        Choice = await input.select(`Choose setting to change: (* means Optional)`, [`<-- Back`].concat(Options));

        if(Choice == `<-- Back`) { return `Back`; }

        for(i=0;i<SettingPointers.length;i++){
            if(Choice.includes(SettingPointers[i])){
                return SettingPointers[i];
            }
        }

        return `Error`;
    },

    DirectoryChanger: async function(directories, DirectoryChangeChoice, OwnDirectory){
        if(!DirectoryChangeChoice.includes(`Override`)){
            DefaultText = directories[DirectoryChangeChoice];
            console.log(`Original Directory: ${DefaultText}`);
            NewText = await input.text(`Please input the new directory to this folder:`);
            NewText = await DirectoryInputSafetyCheck(NewText);
            directories[DirectoryChangeChoice] = NewText;
        } else {
            DefaultText = directories.Optional[DirectoryChangeChoice];
            console.log(`Original Directory: ${DefaultText}`);
            NewText = await input.text(`Please input the new directory to this folder:`);
            NewText = await DirectoryInputSafetyCheck(NewText);
            directories.Optional[DirectoryChangeChoice] = NewText;
        }
        fs.writeJSONSync(`${OwnDirectory}/save_data/directories.json`, directories, {spaces: `\t`});
        return;
    }
}