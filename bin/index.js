//Requirements
const fs = require('fs');
const chalk = require('chalk');
const boxen = require('boxen');

//Code File Extensions
const menu = require('./menu');
const builder = require('./builder');
const { writeJsonSync } = require('fs-extra');

//Variable Setup
let OwnDirectory = __dirname.slice(0,__dirname.length-3);
let WorkingDirectory = process.cwd();
let ProjectData;

async function MainMenuLoop() {
    //Prepare console
    console.clear();
    console.log(boxen(chalk.bold.cyanBright(`Super Mario Odyssey - Project Manager`), {margin: 1, borderStyle: 'double'}));

    console.log(chalk.green.bold(`
Previous Build Type: ${ProjectData.DumpStats.Type}
Previous Build Time: ${ProjectData.DumpStats.Time}
Amount Of Builds Done: ${ProjectData.DumpStats.Amount}\n`));
    
    //Launch main menu
    MenuSelection = await menu.MainMenu();
    switch (MenuSelection){
        case `Build Project (Full)`:
            ProjectData = await builder.Build(ProjectData, WorkingDirectory, true, OwnDirectory);
            MainMenuLoop();
            return;
        case `Build Project (Quick)`:
            ProjectData = await builder.Build(ProjectData, WorkingDirectory, false, OwnDirectory);
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
            LangSelection = await menu.NewLanguage();
            newlang.NewLang(WorkingDirectory, LangSelection, OwnDirectory);
            await menu.GenericConfirm();
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
    if(!fs.existsSync(`${OwnDirectory}/directories.json`)){
        console.log(chalk.red.bold(`No directories.json found!\nPlease open the .json and supply folder paths`));
        writeJsonSync(OwnDirectory+'directories.json', { "EditorCore": "", "SMODirectory": "" });
        menu.GenericConfirm();
        return;
    } else {
        Directories = require('../directories.json');

        //Check if EditorCore directory is invalid
        if(!fs.existsSync(Directories.EditorCore+`/EditorCore.exe`)){
            console.log(chalk.red.bold(`EditorCore directory invalid!\nMake sure this folder contains EditorCore.exe and make sure the directories.json path doesn't end in a slash`));
            menu.GenericConfirm();
            return;
        }

        if(!fs.existsSync(Directories.SMODirectory+`/EffectData/EffectDataBase.szs`)){
            console.log(chalk.red.bold(`SMO dump directory invalid!\nMake sure this folder contains the "Data" folders and make sure the directories.json path doesn't end in a slash`));
            menu.GenericConfirm();
            return;
        }
    }

    //Check and load ProjectData.json
    if(fs.existsSync(WorkingDirectory+`/ProjectData.json`))
    {
        //Load in required files
        ProjectData = await require(WorkingDirectory+`/ProjectData.json`);
        ProgramVersion = await require('../version.json');
        
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