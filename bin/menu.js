const input = require("input");
const chalk = require("chalk");
const boxen = require('boxen');
var fs = require('fs-extra');

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

    SendUninitProjectToSwitch: async function(){
        UserInput = await input.select(`This folder isn't initalized, but there is a romfs folder.\nWould you like to send it to the switch with FTP?`, [`Yes`, `No`]);
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
        `Generate Music`,
        `Information / About`];

        if(!isFTP){
            MenuChoices.push(`Connect To Switch - FTP`);
        } else {
            MenuChoices.push(`Empty server RomFS`);
            MenuChoices.push(`Disconnect FTP`);
        }

        return await input.select(`Menu Menu:`, MenuChoices);
    },

    FTPFolderSelection: async function(WorkingDirectory){
        AllFolders = fs.readdirSync(`${WorkingDirectory}/romfs/`);
        if(AllFolders.length <= 1) { return AllFolders; }
        Selection = input.checkboxes(`Select which folders you want to transfer to your switch:`, AllFolders);
        return Selection;
    },

    FTPSelection: async function(OwnDirectory){
        //Setup command line
        console.clear();
        console.log(chalk.green.bold(`Switch FTP Connector\nAutomatically send builds to console\n`));
        
        //Check if the profiles.json file already exists
        if(fs.existsSync(`${OwnDirectory}save_data/ftp_profiles.json`)){
            //Read in the JSON file
            Profiles = fs.readJSONSync(`${OwnDirectory}save_data/ftp_profiles.json`);

            if(Profiles.saves.length > 0){
                //Confirmed that there is a profile, now open a selection dialog.
                SelectionMenu = [];
                //Create an array of the labels
                for(i=0;i<Profiles.saves.length;i++){
                    SelectionMenu.push(Profiles.saves[i].label);
                }
                SelectionMenu.push(`Create new profile`);
                SelectionChoice = await input.select(`Select a profile to connect to:`, SelectionMenu);

                //Only continue down the profile loading path if they didn't choose to make a new profile
                if(SelectionChoice != `Create new profile`){
                    ReturnObject = {};
                    for(i=0;i<SelectionMenu.length-1;i++){
                        if(SelectionChoice == Profiles.saves[i].label){
                            ReturnObject = Profiles.saves[i];
                            return ReturnObject;
                        }
                    }
                }
            }
        } else {
            //Create json file if it doesn't exist already, then move on.
            fs.writeJsonSync(`${OwnDirectory}save_data/ftp_profiles.json`, {saves: []});
        }

        let AccessObject = {};

        AccessObject.host = await input.text(`Target IP Adress:`);
        AccessObject.port = await input.text(`Port:`);
        AccessObject.user = await input.text(`Username:`);
        AccessObject.password = await input.password(`Password`);
        AccessObject.secure = false;
        AccessObject.label = `NA`;

        if(await input.confirm(`Should this connection be saved?`)) {
            Profiles = fs.readJSONSync(`${OwnDirectory}save_data/ftp_profiles.json`);
            AccessObject.label = `${AccessObject.user} - ${AccessObject.host}:${AccessObject.port}`;
            Profiles.saves.push(AccessObject);
            fs.writeJSONSync(`${OwnDirectory}save_data/ftp_profiles.json`, Profiles);
        }

        return AccessObject;
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
    },

    ProgressBar: function(Label, Current, Target){
        console.log(chalk.cyanBright.bold(`${Label}\n${Current} tasks complete of ${Target}\n${Current/Target*100}%`));
        let TerminalSize = parseInt(process.stdout.columns/2);
        let Result = parseInt(TerminalSize*(Current/Target));
        let BarString = Array(Result).fill(`▓`).concat(Array(TerminalSize-Result).fill(`░`));
        BarString = BarString.join(``);
        console.log(chalk.green.bold(BarString));
        return;
    }
}