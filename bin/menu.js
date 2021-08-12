const input = require("input");
const chalk = require("chalk");
const boxen = require('boxen');
const directories = require('../directories.json');
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

    ConfirmLoadOldProject: async function(){
        UserInput = await input.select(`This project is outdated. Should it load anyway? (May cause issues!)`, [`Yes`, `No`]);
        switch(UserInput){
            case `Yes`:
                return true;
            case `No`:
                return false;
        }
    },

    MainMenu: async function(){
        return await input.select(`Menu Menu:`, [
        `Build Project (Quick)`,
        `Build Project (Full)`,
        `Add Template Objects`,
        `Refresh EditorCore`,
        `Add New Language`,
        `Information / About`]);
    },

    NewLanguage: async function(){
        AllLangs = fs.readdirSync(directories.SMODirectory+`/LocalizedData/`);
        return await input.select(`Please select the language to add to the project`, AllLangs);
    },

    TemplateObject: async function(OwnDirectory){
        AllObjects = fs.readdirSync(`${OwnDirectory}templateszs/`);
        return await input.checkboxes(`Select all templates you would like:`, AllObjects);
    }
}