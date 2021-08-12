const input = require("input");
const chalk = require("chalk");
var fs = require('fs');

module.exports = {
    GenericConfirm: async function(){
        input.select(`Got it?`, [`That's right`, `Yes`])
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
        `Refresh EditorCore`]);
    },

    TemplateObject: async function(OwnDirectory){
        AllObjects = fs.readdirSync(`${OwnDirectory}templateszs/`);
        return await input.checkboxes(`Select all templates you would like:`, AllObjects);
    }
}