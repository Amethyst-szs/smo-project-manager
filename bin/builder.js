const chalk = require("chalk");
const fs = require('fs-extra');
const { execSync } = require('child_process');
const { mkdirSync } = require("fs");
const menu = require('./menu');

let TotalTasks = 5;
let ChangedFiles = [];

function UpdateConsole(Label, Progress){
    console.clear();
    console.log(chalk.red.bold(`Building project...\nDon't close the program or alter any files!\n`));
    menu.ProgressBar(Label, Progress, TotalTasks);
}

function ProcessFolder(ProjectData, WorkingDirectory, FolderContents, Path, Dest, OrigSMOFolder, UserKey){
    //Start by verifying that there is content in this folders
    if(FolderContents.length == 0) {return;}

    //Iterate through these files
    FolderContents.forEach(i => {
        //Before handling the file/folder, read it's date last modified
        CurrentStats = fs.statSync(`${WorkingDirectory}/project/${Path}/${i}`);

        //Perform different actions based on if the object is a file or folder
        if(CurrentStats.isFile()) {

            //Compare to last date modified stored in ProjectData.json
            if(ProjectData.dates[UserKey][OrigSMOFolder].hasOwnProperty(i)){
                if(ProjectData.dates[UserKey][OrigSMOFolder][i] != CurrentStats.mtimeMs){
                    ProjectData.dates[UserKey][OrigSMOFolder][i] = CurrentStats.mtimeMs
                    ChangedFiles.push(i);
                }
            } else {
                ProjectData.dates[UserKey][OrigSMOFolder][i] = CurrentStats.mtimeMs
                ChangedFiles.push(i);
            }

            //Copy file to romfs, then loop back
            fs.copyFileSync(`${WorkingDirectory}/project/${Path}/${i}`,
            `${WorkingDirectory}/romfs/${Dest}/${i}`);
        } else {
            //Enter the sub folder and copy it's files over to the romfs
            SubFolderContents = fs.readdirSync(`${WorkingDirectory}/project/${Path}/${i}/`);
            ProcessFolder(ProjectData, WorkingDirectory, SubFolderContents, Path+`/${i}`, Dest, OrigSMOFolder);
        }
    });
}

module.exports = {
    Build: function(ProjectData, WorkingDirectory, FullBuild, OwnDirectory){
        //Console setup
        console.time(`Duration`);
        UpdateConsole(`Preparing build...`, 0); //Task 0

        //Prepare arrays (DOES NOT INCLUDES TEXT OR CUBEMAP FOLDERS, THOSE ARE HANDLED SEPERATELY)
        const SMOFolders = [`EffectData`, `EventData`, `LayoutData`, `MovieData`, `ObjectData`, `ShaderData`, `SoundData`, `StageData`, `SystemData`, `ObjectData`];
        const ProjectFolders = [`Effects`, `Events`, `UI`, `Video`, `Objects`, `Shaders`, `Sound`, `Stages`, `System`, `CubeMaps`];
        //Reset ChangedFiles for build
        ChangedFiles = [];

        //Load in user's personal key and then verify this user has a slot in the dates object
        UserKey = fs.readJSONSync(`${OwnDirectory}/save_data/unique_key.json`);
        UserKey = UserKey.Main;

        if(!ProjectData.dates.hasOwnProperty(UserKey)){
            ProjectData.dates[UserKey] = {};
        }

        //If doing a complete build, reset this user's dates key object
        if(FullBuild >= 2) {
            ProjectData.dates[UserKey] = {};
        }

        ///////////////////////
        //Delete previous build
        ///////////////////////

        UpdateConsole(`Removing previous build...`, 1);
        for(i=0;i<SMOFolders.length;i++){
            fs.removeSync(`${WorkingDirectory}/romfs/${SMOFolders[i]}`);
        }

        //Reset LocalizedData if a full build
        if(FullBuild >= 1) {
            fs.removeSync(`${WorkingDirectory}/romfs/LocalizedData/`);

            //Load all language folders from the project folder
            TextContents = fs.readdirSync(`${WorkingDirectory}/project/Text/`);

            //Verify LocalizedData directory
            if(TextContents.length > 0){
                fs.mkdirSync(`${WorkingDirectory}/romfs/LocalizedData`);
            }
        }

        //////////////////////////
        //Recursive object copying
        //////////////////////////

        UpdateConsole(`Creating RomFS folder from project...`, 2);

        for(CurrentFolder=0;CurrentFolder<ProjectFolders.length;CurrentFolder++){
            //Get a list of all files and sub-folders inside this directory
            FolderContents = fs.readdirSync(`${WorkingDirectory}/project/${ProjectFolders[CurrentFolder]}/`);

            //If this folder is empty, skip it and move on to the next
            if(FolderContents.length == 0) {
                //Before skipping the folder, remove this attribute from the ProjectData.json if it exists
                if(ProjectData.dates[UserKey].hasOwnProperty(SMOFolders[CurrentFolder]) && ProjectFolders[CurrentFolder] != `CubeMaps`){
                    delete ProjectData.dates[UserKey][SMOFolders[CurrentFolder]];
                }
                continue; 
            }

            //Start by making the target folder in romfs as prep for the file copying
            if(!fs.existsSync(`${WorkingDirectory}/romfs/${SMOFolders[CurrentFolder]}`)){
                fs.mkdirSync(`${WorkingDirectory}/romfs/${SMOFolders[CurrentFolder]}`);
            }

            //Check to make sure this folder exists in the ProjectData Json
            if(!ProjectData.dates[UserKey].hasOwnProperty(SMOFolders[CurrentFolder])){
                ProjectData.dates[UserKey][SMOFolders[CurrentFolder]] = {};
            }

            //Run code on current folder
            ProcessFolder(ProjectData, WorkingDirectory, FolderContents, ProjectFolders[CurrentFolder], SMOFolders[CurrentFolder], SMOFolders[CurrentFolder], UserKey);
        }

        /////////////////
        //Build Text Data
        /////////////////

        if(FullBuild >= 1) { UpdateConsole(`Building text data... (Full Build Only)`, 3); }

        //Load all language folders from the project folder
        TextContents = fs.readdirSync(`${WorkingDirectory}/project/Text/`);
        MessageDataPath = [`SystemMessage`, `StageMessage`, `LayoutMessage`];

        for(CurrentLang=0;CurrentLang<TextContents.length;CurrentLang++){
            //If not a full build, skip text building
            if(FullBuild == 0) {continue;}

            //If reached this point, you can add "LocalizedDataHandler" to the changed files list
            ChangedFiles.push(`LocalizedDataHandler`);

            //If folder is "Common" handle differently
            if(TextContents[CurrentLang] == `Common`){
                //Make common directory in romfs
                fs.mkdirSync(`${WorkingDirectory}/romfs/LocalizedData/Common/`);

                //Copy common file over
                fs.copyFileSync(`${WorkingDirectory}/project/Text/${TextContents[CurrentLang]}/ProjectData.szs`,
                `${WorkingDirectory}/romfs/LocalizedData/${TextContents[CurrentLang]}/ProjectData.szs`);

                continue;
            }

            //Create directories in romfs section
            fs.mkdirSync(`${WorkingDirectory}/romfs/LocalizedData/${TextContents[CurrentLang]}/MessageData/`, {recursive: true});
            fs.mkdirSync(`${WorkingDirectory}/romfs/LocalizedData/${TextContents[CurrentLang]}/LayoutData/`, {recursive: true});

            //Locate all text folders
            LangContainers = fs.readdirSync(`${WorkingDirectory}/project/Text/${TextContents[CurrentLang]}`);
            for(CurrentContainer=0;CurrentContainer<LangContainers.length;CurrentContainer++){
                //Run SarcTool on current text container
                execSync(`${OwnDirectory}sarctool/sarc_tool.exe -little -compress 9 ${WorkingDirectory}/project/Text/${TextContents[CurrentLang]}/${LangContainers[CurrentContainer]}`, (err, stdout, stderr) => {
                    if (err) {
                    console.log(chalk.red.bold(`SarcTool Error!`));
                    return;
                    }
                });

                if(MessageDataPath.includes(LangContainers[CurrentContainer])){
                    //Copy this compressed file over to the romfs MessageData
                    fs.copyFileSync(`${WorkingDirectory}/project/Text/${TextContents[CurrentLang]}/${LangContainers[CurrentContainer]}.szs`,
                    `${WorkingDirectory}/romfs/LocalizedData/${TextContents[CurrentLang]}/MessageData/${LangContainers[CurrentContainer]}.szs`);
                } else {
                    //Copy this compressed file over to the romfs MessageData
                    fs.copyFileSync(`${WorkingDirectory}/project/Text/${TextContents[CurrentLang]}/${LangContainers[CurrentContainer]}.szs`,
                    `${WorkingDirectory}/romfs/LocalizedData/${TextContents[CurrentLang]}/LayoutData/${LangContainers[CurrentContainer]}.szs`);
                }
                
                //Delete compressed version from the project folder
                fs.removeSync(`${WorkingDirectory}/project/Text/${TextContents[CurrentLang]}/${LangContainers[CurrentContainer]}.szs`);
            }
        }

        //////////////////////////
        //Cleanup SoundData Folder
        //////////////////////////

        //Alert console
        UpdateConsole(`Cleaning up SoundData...`, 4);

        //Read all files in SoundData folder, but first make sure the SoundData folder exists
        isSoundDataFolderExist = fs.existsSync(`${WorkingDirectory}/romfs/SoundData/`);

        if(isSoundDataFolderExist){
            SoundDataContents = fs.readdirSync(`${WorkingDirectory}/romfs/SoundData/`);

            //Make stream directory
            fs.mkdirSync(`${WorkingDirectory}/romfs/SoundData/stream/`);
    
            for(i=0;i<SoundDataContents.length;i++){
                if(SoundDataContents[i].includes(`.bfstm`)){
                    fs.moveSync(`${WorkingDirectory}/romfs/SoundData/${SoundDataContents[i]}`,
                    `${WorkingDirectory}/romfs/SoundData/stream/${SoundDataContents[i]}`);
                }
                if(SoundDataContents[i].includes(`.bfstp`)){
                    fs.removeSync(`${WorkingDirectory}/romfs/SoundData/${SoundDataContents[i]}`);
                }
            }

            //Check at end if SoundData is junk
            if(SoundDataContents.length < 1){
                fs.removeSync(`${WorkingDirectory}/romfs/SoundData/`);
            }
        }

        /////////////////////////
        //Update ProjectData.json
        /////////////////////////
        
        //Alert console
        UpdateConsole(`Updating project information...`, 5);

        //Update time
        Time = new Date();
        ProjectData.DumpStats.Time = (Time.getMonth()+1)+'-'+Time.getDate()+'-'+Time.getFullYear()+' '+
        Time.getHours()+":"+Time.getMinutes()+":" +Time.getSeconds();

        //Update Type
        switch(FullBuild){
            case 0:
                ProjectData.DumpStats.Type = `Quick`;
                break;
            case 1:
                ProjectData.DumpStats.Type = `Full`;
                break;
            case 2:
                ProjectData.DumpStats.Type = `Complete`;
                break;
        }

        //Update has been dumped
        ProjectData.DumpStats.isUndumped = false;

        //Increment Amount Of Dumps
        ProjectData.DumpStats.Amount++;

        //Write changes to file
        fs.writeJSONSync(WorkingDirectory+`/ProjectData.json`, ProjectData, {spaces: `\t`});

        //Log duration
        console.timeEnd(`Duration`);

        //Return
        return ChangedFiles;
    }
}