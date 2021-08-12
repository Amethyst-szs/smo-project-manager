//Requirements
const fs = require('fs');
const chalk = require('chalk');
const boxen = require('boxen');

//Code File Extensions
const menu = require('./menu');
const builder = require('./builder');

//Variable Setup
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
            ProjectData = await builder.Build(ProjectData, WorkingDirectory, true);
            MainMenuLoop();
            return;
        case `Build Project (Quick)`:
            ProjectData = await builder.Build(ProjectData, WorkingDirectory, false);
            MainMenuLoop();
            return;
        case `Add Template Objects`:
            SelectedObjects = await menu.TemplateObject();
            const template = require('./template');
            template.CopyFiles(WorkingDirectory, SelectedObjects);
            MainMenuLoop();
            return;
        case `Refresh EditorCore`:
            const editorcore = require('./editorcore');
            editorcore.Refresh(WorkingDirectory);
            MainMenuLoop();
            return;
        default:
            console.log(`Invalid Selection`);
            MainMenuLoop();
            return;
    }
}

async function SetupCheck() {
    //Working Directory Check
    console.log(chalk.cyan.underline(`Checking directory...`));

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
        console.clear();
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