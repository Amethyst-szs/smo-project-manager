//Requirements
const fs = require('fs-extra');
const chalk = require('chalk');
const boxen = require('boxen');
const input = require('input');
const { writeJsonSync } = require('fs-extra');

//Code File Extensions
const menu = require('./menu');
const fileexplorer = require('./fileexplorer');
const starlight = require('./starlight');

//Variable Setup
let OwnDirectory = __dirname.slice(0,__dirname.length-3);
let WorkingDirectory = process.cwd();
let YuzuDirectory = process.env[`APPDATA`]+`/yuzu/load/0100000000010000/`;
let ProjectData;
let FTPAccessObject;
let isFTP = false;
let isYuzu = false;
let isWavPlugin = false;
let isEditorCore = false;

async function CheckPluginStatus(FunctionalDirectories, directorysetup){
    //If the directories are all good to go, check the optional ones for funcationality
    if(FunctionalDirectories == true){
        isWavPlugin = directorysetup.WavPluginCheck();
        isEditorCore = directorysetup.EditorCoreCheck();
        YuzuDirectory = directorysetup.YuzuCheck(YuzuDirectory);
    }
}

async function MainMenuLoop() {
    //Prepare console
    ProjectData = fs.readJSONSync(WorkingDirectory+`/ProjectData.json`); 
    await menu.FormatMainMenu(isFTP, isYuzu, ProjectData, FTPAccessObject, YuzuDirectory);
    
    //Launch main menu
    MenuSelection = await menu.MainMenu(isFTP, isWavPlugin, isEditorCore, isYuzu);

    //Handle the selection and decide if the main menu should be reloaded after it is completed
    let isReloadMain = true;
    isReloadMain = await menu.MainMenuSelectionHandler(MenuSelection, ProjectData, WorkingDirectory,
    OwnDirectory, isFTP, FTPAccessObject, isYuzu, YuzuDirectory, menu);
    
    if(isReloadMain){
        if(typeof isReloadMain === typeof {}){
            if(isReloadMain.isFTP == true){
                isFTP = true;
                FTPAccessObject = isReloadMain;
            }

            if(isReloadMain.isYuzu == true){
                isYuzu = true;
            }
        }
        MainMenuLoop();
        return;
    } else {
        WorkingDirectory = null;
        isFTP = false;
        isYuzu = false;
        starlight.Shutdown();
        SetupCheck();
        return;
    }

}

async function SetupCheck() {
    //Setup unique_key
    if(!fs.existsSync(`${OwnDirectory}save_data/unique_key.json`)){
        KeyGenerator = require('./identity');
        KeyGenerator.GenerateKey(OwnDirectory);
    }

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

    //If the directories are all good to go, check the optional ones for usage
    CheckPluginStatus(FunctionalDirectories, directorysetup);

    const projectinit = require('./projectinit');

    //Process the WorkingDirectory before trying to load ProjectData.json
    console.log(WorkingDirectory);

    //Check and load ProjectData.json
    if(fs.existsSync(WorkingDirectory+`/ProjectData.json`) && FunctionalDirectories)
    {
        //Load in required files
        ProjectData = await require(WorkingDirectory+`/ProjectData.json`);
        ProgramVersion = require('../save_data/version.json');
        UserKey = require('../save_data/unique_key.json');
        
        //Check for project updates
        if(ProjectData.Version != ProgramVersion.Version){
            projectinit.UpdateProject(WorkingDirectory, ProgramVersion.Version);
            ProjectData = await require(WorkingDirectory+`/ProjectData.json`);
        }

        //Connect to Starlight if enabled
        if(ProjectData.starlight == true){
            //If this is the first launch with Starlight enabled, add the starlight files
            if(!fs.existsSync(`${WorkingDirectory}/starlight/`)){
                starlight.CreateStarlight(WorkingDirectory, OwnDirectory);
            }

            //Once starlight is verified, send message to the server that it is good to go
            starlight.LoggerInit(OwnDirectory);
        } else {
            //If we aren't dealing with a starlight project, shut down the alternate server interface
            starlight.Shutdown(OwnDirectory);
        }
        
        MainMenuLoop();
    } 
    else //Open boot menu if no ProjectData.json is found 
    {
        //Require 2 modules for the optional boot menu
        const bootmenu = require('./bootmenu');
        BootActionComplete = false;

        while(!BootActionComplete){ //Loop the boot menu until the boot action is complete
            console.clear();
            console.log(boxen(chalk.bold.cyanBright(`Super Mario Odyssey - Project Manager`),
            {margin: 1, borderStyle: 'double'}));
            if(!FunctionalDirectories) { console.log(chalk.redBright.bold(`Issue with directories! Opening and loading projects is disabled until fixed`)); }

            BootAction = await bootmenu.MainSelection(FunctionalDirectories);
            
            switch(BootAction){
                case `Quit`:
                    process.exit();
                    break;
                case `Create New Project`:
                    //Select the project folder
                    ProjectDrive = await fileexplorer.DriveSelect();
                    ProjectFolder = await fileexplorer.MainExplorer(ProjectDrive, ``, false, true);
                    if(ProjectFolder == `NA`) { break; }

                    //Create the project in the selected folder
                    WorkingDirectory = ProjectFolder;
                    ProjectData = await projectinit.CreateProject(WorkingDirectory);
                    BootActionComplete = true;
                    MainMenuLoop();
                    break;
                case `Load Project`:
                    //Select the project folder
                    ProjectDrive = await fileexplorer.DriveSelect();
                    ProjectFolder = await fileexplorer.MainExplorer(ProjectDrive, ``, true, true);
                    if(ProjectFolder == `NA`) { break; }

                    WorkingDirectory = ProjectFolder;
                    ProjectData = fs.readJSONSync(`${WorkingDirectory}/ProjectData.json`);
                    BootActionComplete = true;
                    MainMenuLoop();
                    break;
                case `Edit Directories`:
                    directories = require('../save_data/directories.json');
                    DirectoryChangeChoice = await bootmenu.DirectorySetupMenu(directories);
                    if(DirectoryChangeChoice == `Back`) { break; }
                    await bootmenu.DirectoryChanger(directories, DirectoryChangeChoice, OwnDirectory);
                    FunctionalDirectories = !directorysetup.IssuesCheck();
                    isWavPlugin = directorysetup.WavPluginCheck();
                    isEditorCore = directorysetup.EditorCoreCheck();
                    break;
            }
        }
    }
}

SetupCheck();