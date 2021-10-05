//Requirements
const fs = require('fs-extra');
const chalk = require('chalk');
const boxen = require('boxen');
const input = require('input');
const { writeJsonSync } = require('fs-extra');

//Code File Extensions
const menu = require('./menu');
const builder = require('./builder');
const ftpconnector = require('./ftpconnector');
const fileexplorer = require('./fileexplorer');

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
        case `Build Project (Complete)`:
            ChangedFiles = await builder.Build(ProjectData, WorkingDirectory, 2, OwnDirectory);
            ProjectData = fs.readJSONSync(WorkingDirectory+`/ProjectData.json`); 
            if(isFTP) {
                await ftpconnector.FTPClearRomfs(FTPAccessObject);
                await ftpconnector.FTPTransferProject(WorkingDirectory, ChangedFiles, FTPAccessObject);
            }
            await menu.GenericConfirm();
            MainMenuLoop();
            return;
        case `Build Project (Full)`:
            ChangedFiles = await builder.Build(ProjectData, WorkingDirectory, 1, OwnDirectory);
            ProjectData = fs.readJSONSync(WorkingDirectory+`/ProjectData.json`); 
            if(isFTP) {
                await ftpconnector.FTPTransferProject(WorkingDirectory, ChangedFiles, FTPAccessObject);
            }
            await menu.GenericConfirm();
            MainMenuLoop();
            return;
        case `Build Project (Quick)`:
            ChangedFiles = await builder.Build(ProjectData, WorkingDirectory, 0, OwnDirectory);
            ProjectData = fs.readJSONSync(WorkingDirectory+`/ProjectData.json`); 
            if(isFTP) {
                await ftpconnector.FTPTransferProject(WorkingDirectory, ChangedFiles, FTPAccessObject);
            }
            await menu.GenericConfirm();
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
            await menu.GenericConfirm();
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
        case `Generate Music`:
            const wavetool = require('./wavetool');
            wavobj = await menu.MusicGenerator(WorkingDirectory);
            wavetool.Main(WorkingDirectory, wavobj);
            await menu.GenericConfirm();
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
    FunctionalDirectories = true;

    if(!fs.existsSync(`${OwnDirectory}/save_data/directories.json`)){
        console.log(chalk.red.bold(`No directories.json found! (First boot?)\nPlease set this up in the menu`));
        directorysetup.CreateFile(OwnDirectory);
        menu.GenericConfirm();
        FunctionalDirectories = false;
    } else {
        isFoundIssue = await directorysetup.IssuesCheck(OwnDirectory);
        if(isFoundIssue){
            menu.GenericConfirm();
            FunctionalDirectories = false;
        }
    }

    const projectinit = require('./projectinit');

    //Process the WorkingDirectory before trying to load ProjectData.json
    console.log(WorkingDirectory);

    //Check and load ProjectData.json
    if(fs.existsSync(WorkingDirectory+`/ProjectData.json`) && FunctionalDirectories)
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
                projectinit.UpdateProject(WorkingDirectory, ProgramVersion.Version);
                ProjectData = await require(WorkingDirectory+`/ProjectData.json`);
                MainMenuLoop();
            }
            return;
        }
    } 
    else //Open boot menu if no ProjectData.json is found
    {
        console.clear();
        //Require 2 modules for the optional boot menu
        bootmenu = require('./bootmenu');

        console.log(boxen(chalk.bold.cyanBright(`Super Mario Odyssey - Project Manager`),
        {margin: 1, borderStyle: 'double'}));
        BootAction = await bootmenu.MainSelection(FunctionalDirectories);
        BootActionComplete = false;

        while(!BootActionComplete){
            switch(BootAction){
                case `Quit`:
                    process.exit();
                    break;
                case `Create New Project`:
                    //Select the project folder
                    ProjectDrive = await fileexplorer.DriveSelect();
                    ProjectFolder = await fileexplorer.MainExplorer(ProjectDrive, ``);

                    //Create the project in the selected folder
                    WorkingDirectory = ProjectFolder;
                    ProjectData = await projectinit.CreateProject(WorkingDirectory);
                    BootActionComplete = true;
                    MainMenuLoop();
                    break;
                case `Load Project`:
                    //Select the project folder
                    ProjectDrive = await fileexplorer.DriveSelect();
                    ProjectFolder = await fileexplorer.MainExplorer(ProjectDrive, ``);

                    WorkingDirectory = ProjectFolder;
                    ProjectData = fs.readJSONSync(`${WorkingDirectory}/ProjectData.json`);
                    BootActionComplete = true;
                    MainMenuLoop();
                    break;
            }
        }
    }
}

SetupCheck();