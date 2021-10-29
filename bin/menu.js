const input = require("input");
const chalk = require("chalk");
const boxen = require('boxen');
var fs = require('fs-extra');

module.exports = {
    GenericConfirm: async function(){
        await input.select(`Got it?`, [`That's right`, `Yes`])
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

    FormatMainMenu: async function(isFTP, isYuzu, ProjectData, FTPAccessObject, YuzuDirectory){
        console.clear();
        console.log(boxen(chalk.bold.cyanBright(`Super Mario Odyssey - Project Manager\n${ProjectData.PName}`), {margin: 1, borderStyle: 'double'}));
        if(isFTP) {console.log(chalk.blueBright.italic.bold(`Connected as ${FTPAccessObject.user} on port ${FTPAccessObject.port}`));}
        if(isYuzu) {console.log(chalk.blueBright.italic.bold(`Connected to Yuzu in ${YuzuDirectory}`));}
        console.log(chalk.green.bold(`
    Previous Build Type: ${ProjectData.DumpStats.Type}
    Previous Build Time: ${ProjectData.DumpStats.Time}
    Amount Of Builds Done: ${ProjectData.DumpStats.Amount}\n`));
    },

    MainMenu: async function(isFTP, isWavPlugin, isEditorCore, isYuzu){
        MenuChoices = [
        `Build Project (Quick)`,
        `Build Project (Full)`,
        `Build Project (Complete)`,
        `Add Template Objects`,
        `Add New Language`];
        
        if(isEditorCore){
            MenuChoices.push(`Refresh EditorCore`);
        }

        if(isWavPlugin){
            MenuChoices.push(`Generate Music`);
        }

        if(!isFTP && !isYuzu){
            MenuChoices.push(`Connect To Switch - FTP`);
            MenuChoices.push(`Connect To Switch - Yuzu`);
        } 
        
        if(isFTP) {
            MenuChoices.push(`Empty server RomFS`);
            MenuChoices.push(`Disconnect FTP (Disabled)`);
        }

        MenuChoices.push(`Close Project`);

        return await input.select(`Menu Menu:`, MenuChoices);
    },

    MainMenuSelectionHandler: async function(MenuSelection, ProjectData, WorkingDirectory, OwnDirectory,
        isFTP, FTPAccessObject, isYuzu, YuzuDirectory, menu){
        //Enough things use the FTP connector to just include it for all menu selections
        const ftpconnector = require('./ftpconnector');

        //Prepare menu selector's switch case
        MenuSelectionFull = MenuSelection;
        if(MenuSelection.includes(`(`)) { MenuSelection = MenuSelection.slice(0, MenuSelection.indexOf(`(`)-1); }

        console.log(MenuSelection, MenuSelection.slice(0, MenuSelection.indexOf(`(`)-1))
        switch (MenuSelection){
            case `Build Project`:
                //Require builder.js
                builder = require('./builder');

                //Start by figuring out which type of build it is
                BuildType = 0;
                switch(MenuSelectionFull.slice(MenuSelectionFull.indexOf(`(`)+1, MenuSelectionFull.length-1)){
                    case `Full`:
                        BuildType = 1;
                        break;
                    case `Complete`:
                        BuildType = 2;
                        break;
                }

                //Actually build the project, and return a list of the files that changed
                ChangedFiles = await builder.Build(ProjectData, WorkingDirectory, BuildType, OwnDirectory, isYuzu, isFTP);

                //Run extra stuff if hooked into FTP or Yuzu
                if(isFTP) {
                    await ftpconnector.FTPTransferProject(WorkingDirectory, ChangedFiles, FTPAccessObject);
                }
                if(isYuzu) {
                    fs.emptyDirSync(`${YuzuDirectory}/${ProjectData.PName}/romfs/`);
                    fs.copySync(`${WorkingDirectory}/romfs/`, `${YuzuDirectory}/${ProjectData.PName}/romfs/`);
                }

                await menu.GenericConfirm();
                break;
            case `Add Template Objects`:
                SelectedObjects = await menu.TemplateObject(OwnDirectory);
                const template = require('./template');
                template.CopyFiles(WorkingDirectory, SelectedObjects, OwnDirectory);
                break;
            case `Refresh EditorCore`:
                const editorcore = require('./editorcore');
                editorcore.Refresh(WorkingDirectory);
                await menu.GenericConfirm();
                break;
            case `Add New Language`:
                const newlang = require('./newlang');
                const directories = require('../save_data/directories.json');
                LangSelection = await menu.NewLanguage(directories);
                newlang.NewLang(WorkingDirectory, LangSelection, OwnDirectory);
                await menu.GenericConfirm();
                break;
            case `Generate Music`:
                const wavetool = require('./wavetool');
                wavobj = await menu.MusicGenerator(WorkingDirectory);
                wavetool.Main(WorkingDirectory, wavobj);
                await menu.GenericConfirm();
                break;
            case `Connect To Switch - FTP`:
                FTPAccessObject = await menu.FTPSelection(OwnDirectory);
                if(FTPAccessObject) { 
                    isFTP = await ftpconnector.FTPSyncCheck(FTPAccessObject);   
                    FTPAccessObject.isFTP = isFTP; 
                    return FTPAccessObject;
                }
                break;
            case `Connect To Switch - Yuzu`:
                return { "isYuzu": true }
            case `Empty server RomFS`:
                await ftpconnector.FTPClearRomfs(FTPAccessObject);
                await menu.GenericConfirm();
                break;
            case `Disconnect FTP`:
                isFTP = false;
                FTPAccessObject = {};
                break;
            case `Close Project`:
                return false;
            default:
                console.log(`Invalid Selection`);
                await menu.GenericConfirm();
                break;
        }
        return true;
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
                SelectionMenu.push(`Create new profile`, `Back`);
                SelectionChoice = await input.select(`Select a profile to connect to:`, SelectionMenu);

                //Check if the connection should be adorted
                if(SelectionChoice == `Back`){
                    return false;
                }

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

    MusicGenerator: async function(WorkingDirectory){
        wavobj = {};
        //Let the user select which sound file they want
        AllSourceFiles = fs.readdirSync(`${WorkingDirectory}/project/AllUserContent/Sounds/`);
        while(AllSourceFiles.length <= 1){ AllSourceFiles.push(`None`); }
        wavobj.target = await input.select(`Please select your audio file from AllUserContent/Sounds/`, AllSourceFiles);
        
        //Decide if you are using a loop setup
        wavobj.type = await input.select(`Does this song have custom loop points?`, ["No", "Loops"]);

        //If using custom loop points, ask the user for them
        if(wavobj.type == `Loops`){
            const ProjectData = fs.readJSONSync(`${WorkingDirectory}/ProjectData.json`);
            if(ProjectData.songs.hasOwnProperty(wavobj.target)){
                wavobj.start = await input.text(`Please input your loop start value:`, {default: ProjectData.songs[wavobj.target].start});
                wavobj.end = await input.text(`Please input your loop end value:`, {default: ProjectData.songs[wavobj.target].end});
            } else {
                wavobj.start = await input.text(`Please input your loop start value:`, {default: 0});
                wavobj.end = await input.text(`Please input your loop end value:`, {default: 100000});
            }
        }

        return wavobj;
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