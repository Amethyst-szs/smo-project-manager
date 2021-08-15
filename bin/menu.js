const input = require("input");
const chalk = require("chalk");
const boxen = require('boxen');
var fs = require('fs');

module.exports = {
    GenericConfirm: async function(){
        await input.select(`Got it?`, [`That's right`, `Yes`])
    },

    Information: async function(){
        console.clear();
        console.log(boxen(chalk.bold.cyanBright(`Super Mario Odyssey - Project Manager`), {margin: 1, borderStyle: 'double'}));

        //Header
        console.log(chalk.cyan.bold(`Help & Other Information:\n`));

        //Command details
        console.log(`Build Project (Quick) - Builds every part of the project execpt the text. Further optimizations are planned.\n`,
        `Build Project (Full) - Rebuilds the entire project into the "romfs" folder for running in game.\n`,
        `Add Template Objects - Allows you to select objects to add as templates. Early WIP. Check your project/Objects/ folder.\n`,
        `Refresh EditorCore - Adds your custom models to EditorCore and resets EditorCore so it looks for your new models.\n`,
        `Add New Language - Select a language and it adds the files to your project/text/ folder\n\n`);

        return await input.select(`Got it?`, [`That's right`, `Yes`]);
    },

    InitalizeProject: async function(){
        UserInput = await input.select(`This folder isn't initalized, would you like to initalize it?`, [`Yes`, `No`]);
        switch(UserInput){
            case `Yes`:
                return true;
            case `No`:
                return false;
        }
    },

    TypingWindow: async function(){
        return await input.text(`Type here: `);
    },

    ConfirmLoadOldProject: async function(){
        UserInput = await input.select(`This project is outdated. Should it load anyway? (May cause issues!)`, [`Yes`, `No`]);
        switch(UserInput){
            case `Yes`:
                return true;
            case `No`:
                return false;
        }
    },

    MainMenu: async function(isFTP){
        MenuChoices = [
        `Build Project (Quick)`,
        `Build Project (Full)`,
        `Add Template Objects`,
        `Refresh EditorCore`,
        `Add New Language`,
        `Information / About`];

        if(!isFTP){
            MenuChoices.push(`Connect To Switch - FTP`);
        } else {
            MenuChoices.push(`Empty server RomFS`);
        }

        return await input.select(`Menu Menu:`, MenuChoices);
    },

    FTPFolderSelection: async function(WorkingDirectory){
        AllFolders = fs.readdirSync(`${WorkingDirectory}/romfs/`);
        Selection = input.checkboxes(`Select which folders you want to transfer to your switch:`, AllFolders);
        return Selection;
    },

    FTPSelection: async function(){
        console.clear();
        console.log(chalk.green.bold(`Switch FTP Connector\nAutomatically send builds to console\n`));

        let AccessObject = {};

        AccessObject.host = await input.text(`Target IP Adress:`);
        AccessObject.port = await input.text(`Port:`);
        AccessObject.user = await input.text(`Username:`);
        AccessObject.password = await input.password(`Password`);
        AccessObject.secure = false;

        return AccessObject
    },

    NewLanguage: async function(directories){
        let isUseOverride = false;
        if(Directories.Optional.LocalizedDataOverride != ``){
            isUseOverride = fs.existsSync(Directories.Optional.LocalizedDataOverride+`/Common/ProjectData.szs`);
        }
        
        console.log(chalk.yellowBright(`Using LocalizedDataOverride: ${isUseOverride}`));

        let AllLangs;

        if(isUseOverride){
            AllLangs = fs.readdirSync(directories.Optional.LocalizedDataOverride+`/`);
        } else {
            AllLangs = fs.readdirSync(directories.SMODirectory+`/LocalizedData/`);
        }

        return await input.select(`Please select the language to add to the project`, AllLangs);
    },

    TemplateObject: async function(OwnDirectory){
        AllObjects = fs.readdirSync(`${OwnDirectory}templateszs/`);
        return await input.checkboxes(`Select all templates you would like:`, AllObjects);
    }
}