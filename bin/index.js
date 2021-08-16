//Requirements
const fs = require('fs');
const chalk = require('chalk');
const boxen = require('boxen');
const { writeJsonSync } = require('fs-extra');

//Code File Extensions
const menu = require('./menu');
const builder = require('./builder');
const ftpconnector = require('./ftpconnector');

//Variable Setup
let OwnDirectory = __dirname.slice(0,__dirname.length-3);
let WorkingDirectory = process.cwd();
let ProjectData;
let FTPAccessObject;
let isFTP = false;

async function MainMenuLoop() {
    //Prepare console
    console.clear();
    console.log(boxen(chalk.bold.cyanBright(`Super Mario Odyssey - Project Manager`), {margin: 1, borderStyle: 'double'}));
    if(isFTP) {console.log(chalk.blueBright.italic.bold(`Connected as ${FTPAccessObject.user} on port ${FTPAccessObject.port}`));}
    console.log(chalk.green.bold(`
Previous Build Type: ${ProjectData.DumpStats.Type}
Previous Build Time: ${ProjectData.DumpStats.Time}
Amount Of Builds Done: ${ProjectData.DumpStats.Amount}\n`));
    
    //Launch main menu
    MenuSelection = await menu.MainMenu(isFTP);
    switch (MenuSelection){
        case `Build Project (Full)`:
            ProjectData = await builder.Build(ProjectData, WorkingDirectory, true, OwnDirectory);
            if(isFTP) {
                SelectedFolders = await menu.FTPFolderSelection(WorkingDirectory);
                await ftpconnector.FTPTransferProject(WorkingDirectory, SelectedFolders, FTPAccessObject);
                await menu.GenericConfirm();
            }
            MainMenuLoop();
            return;
        case `Build Project (Quick)`:
            ProjectData = await builder.Build(ProjectData, WorkingDirectory, false, OwnDirectory);
            if(isFTP) {
                SelectedFolders = await menu.FTPFolderSelection(WorkingDirectory);
                await ftpconnector.FTPTransferProject(WorkingDirectory, SelectedFolders, FTPAccessObject);
                await menu.GenericConfirm();
            }
            MainMenuLoop();
            return;
        case `Add Template Objects`:
            SelectedObjects = await menu.TemplateObject(OwnDirectory);
            const template = require('./template');
            template.CopyFiles(WorkingDirectory, SelectedObjects, OwnDirectory);
            MainMenuLoop();
            return;
        case `Refresh EditorCore`:
            const editorcore = require('./editorcore');
            editorcore.Refresh(WorkingDirectory);
            MainMenuLoop();
            return;
        case `Add New Language`:
            const newlang = require('./newlang');
            const directories = require('../save_data/directories.json');
            LangSelection = await menu.NewLanguage(directories);
            newlang.NewLang(WorkingDirectory, LangSelection, OwnDirectory);
            await menu.GenericConfirm();
            MainMenuLoop();
            return;
        case `Information / About`:
            await menu.Information();
            MainMenuLoop();
            return;
        case `Connect To Switch - FTP`:
            FTPAccessObject = await menu.FTPSelection(OwnDirectory);
            isFTP = await ftpconnector.FTPSyncCheck(FTPAccessObject);
            MainMenuLoop();
            return;
        case `Empty server RomFS`:
            await ftpconnector.FTPClearRomfs(FTPAccessObject);
            await menu.GenericConfirm();
            MainMenuLoop();
            return;
        case `Disconnect FTP`:
            isFTP = false;
            FTPAccessObject = {};
            MainMenuLoop();
            return;
        default:
            console.log(`Invalid Selection`);
            await menu.GenericConfirm();
            MainMenuLoop();
            return;
    }
}

async function SetupCheck() {
    //Working Directory Check
    console.log(chalk.cyan.underline(`Checking directory...`));
    
    //Check Directories.json
    const directorysetup = require('./directorysetup');

    if(!fs.existsSync(`${OwnDirectory}/save_data/directories.json`)){
        console.log(chalk.red.bold(`No directories.json found!\nPlease open the .json and supply folder paths`));
        directorysetup.CreateFile(OwnDirectory);
        menu.GenericConfirm();
        return;
    } else {
        isFoundIssue = await directorysetup.IssuesCheck(OwnDirectory);
        if(isFoundIssue){
            menu.GenericConfirm();
            return true;
        }
    }

    //Check and load ProjectData.json
    if(fs.existsSync(WorkingDirectory+`/ProjectData.json`))
    {
        //Load in required files
        ProjectData = await require(WorkingDirectory+`/ProjectData.json`);
        ProgramVersion = require('../save_data/version.json');
        
        //Check for project updates
        if(ProjectData.Version == ProgramVersion.Version){
            //Program and project are matching versions, go to menu!
            MainMenuLoop();
        }
        else
        {
            //Confirm load despite unmatching versions
            Confirmation = await menu.ConfirmLoadOldProject();
            if(Confirmation)
            {
                MainMenuLoop();
            }
            return;
        }
    } 
    else
    {
        //Open selection about what to do with uninitalized project folder
        InitalizeConfirmation = await menu.InitalizeProject();
        if(InitalizeConfirmation)
        {
            //Prepare folder
            const projectinit = require('./projectinit');
            ProjectData = await projectinit.CreateProject(WorkingDirectory);
            MainMenuLoop();
        }
        else
        {
            //Quit Program
            process.exit();
        }

    }
}

SetupCheck();