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
        jsonfile.writeFileSync(OwnDirectory+'directories.json', directoriesDefault);
        return;
    },
    
    IssuesCheck: function(OwnDirectory){
        Directories = require('../directories.json');

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
            fs.writeJsonSync(OwnDirectory+'directories.json', Directories);
            return true;
        }

        return false;
    },

    InitalSetup: async function(){
        const menu = require('./menu');
        let ReturnObject = {}
        let ValidProgress = false;

        console.clear()
        console.log(chalk.yellowBright.bold(`We need to set up some directories first!\nFirst off, what is your EditorCore directory?`));
        while(ValidProgress == false){
            let EditorCoreDir = new String;
            EditorCoreDir = await menu.TypingWindow();
            for(i=0;i<EditorCoreDir.length;i++){
                if(EditorCoreDir[i].includes(`\\`)){ EditorCoreDir[i] = `/`; }
            }
            console.log(EditorCoreDir+`/EditorCore.exe`);
            if(fs.existsSync(EditorCoreDir+`/EditorCore.exe`)){

            } else {
                console.log(chalk.red.bold(`Hmm... that doesn't seem right\nTry again and make sure your path doesn't end in a slash`));
            }
        }
    }
}