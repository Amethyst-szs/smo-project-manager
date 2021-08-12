const chalk = require("chalk");
const fs = require('fs-extra');
const jsonfile = require('jsonfile');
const { execSync } = require('child_process');
const { mkdirSync } = require("fs");

module.exports = {
    Build: function(ProjectData, WorkingDirectory, FullBuild, OwnDirectory){
        //Console setup
        console.clear();
        console.log(chalk.red.bold(`Building project...\nDon't close the program or alter any files!\n`));

        //Prepare arrays (DOES NOT INCLUDES TEXT OR CUBEMAP FOLDERS, THOSE ARE HANDLED SEPERATELY)
        SMOFolders = [`EffectData`, `EventData`, `LayoutData`, `MovieData`, `ObjectData`, `ShaderData`, `SoundData`, `StageData`, `SystemData`];
        ProjectFolders = [`Effects`, `Events`, `UI`, `Video`, `Objects`, `Shaders`, `Sound`, `Stages`, `System`];

        ///////////////////////
        //Delete previous build
        ///////////////////////

        console.log(`Deleting previous build...`);
        for(i=0;i<SMOFolders.length;i++){
            fs.removeSync(`${WorkingDirectory}/romfs/${SMOFolders[i]}`);
        }

        //Reset LocalizedData if a full build
        if(FullBuild) {
            fs.removeSync(`${WorkingDirectory}/romfs/LocalizedData/`);
            fs.mkdirSync(`${WorkingDirectory}/romfs/LocalizedData/`);
        }

        //////////////////////////
        //Recursive object copying
        //////////////////////////

        console.log(`Reformatting project into RomFS directories...`);

        for(CurrentFolder=0;CurrentFolder<ProjectFolders.length;CurrentFolder++){
            //Get a list of all files and sub-folders inside this directory
            FolderContents = fs.readdirSync(`${WorkingDirectory}/project/${ProjectFolders[CurrentFolder]}/`);

            //If this folder is empty, skip it and move on to the next
            if(FolderContents.length == 0) { continue; }

            //Console log progress
            console.log(`${ProjectFolders[CurrentFolder]} ---> ${SMOFolders[CurrentFolder]}`);

            //Start by making the target folder in romfs as prep for the file copying
            fs.mkdirSync(`${WorkingDirectory}/romfs/${SMOFolders[CurrentFolder]}`);

            //Iterate through these files
            for(CurrentFile=0;CurrentFile<FolderContents.length;CurrentFile++){
                //Start by verifying that there is content in these folders
                if(FolderContents.length == 0) {continue;}
                
                //Check if the requested object is a folder or a file
                isSubFolder = false;
                if(!FolderContents[CurrentFile].includes(`.`)) {isSubFolder = true};

                //Perform different actions based on if the object is a file or folder
                if(isSubFolder == false)
                {
                    //Copy file to romfs, then loop back
                    fs.copyFileSync(`${WorkingDirectory}/project/${ProjectFolders[CurrentFolder]}/${FolderContents[CurrentFile]}`,
                    `${WorkingDirectory}/romfs/${SMOFolders[CurrentFolder]}/${FolderContents[CurrentFile]}`);
                }
                else
                {
                    //Enter the sub folder and copy it's files over to the romfs
                    SubFolderContents = fs.readdirSync(`${WorkingDirectory}/project/${ProjectFolders[CurrentFolder]}/${FolderContents[CurrentFile]}/`)

                    for(CurrentSubFile=0;CurrentSubFile<SubFolderContents.length;CurrentSubFile++){
                        //Start by verifying that there is content in these folders
                        if(SubFolderContents.length == 0) {continue;}

                        //Copy files from sub folder to romfs, then loop back
                        fs.copyFileSync(`${WorkingDirectory}/project/${ProjectFolders[CurrentFolder]}/${FolderContents[CurrentFile]}/${SubFolderContents[CurrentSubFile]}`,
                        `${WorkingDirectory}/romfs/${SMOFolders[CurrentFolder]}/${SubFolderContents[CurrentSubFile]}`);
                    }
                }
            }
        }

        /////////////////////////////
        //Copy CubeMaps to ObjectData
        /////////////////////////////

        console.log(`Transporting CubeMaps...`);

        //Read the CubeMap directory, then copy each file to the ObjectData folder
        CubeMapContents = fs.readdirSync(`${WorkingDirectory}/project/CubeMaps/`);
        for(CurrentFile=0;CurrentFile<CubeMapContents.length;CurrentFile++){
            console.log(CubeMapContents[CurrentFile]);

            fs.copyFileSync(`${WorkingDirectory}/project/CubeMaps/${CubeMapContents[CurrentFile]}`,
            `${WorkingDirectory}/romfs/ObjectData/${CubeMapContents[CurrentFile]}`);
        }

        /////////////////
        //Build Text Data
        /////////////////

        //Load all language folders from the project folder
        TextContents = fs.readdirSync(`${WorkingDirectory}/project/Text/`);
        for(CurrentLang=0;CurrentLang<TextContents.length;CurrentLang++){
            //If not a full build, skip text building
            if(!FullBuild) {continue;}

            //If folder is "Common" handle differently
            if(TextContents[CurrentLang] == `Common`){
                //Alert user that common language folder is being copied
                console.log(`"Common" text folder found! Copying...`);

                //Make common directory in romfs
                fs.mkdirSync(`${WorkingDirectory}/romfs/LocalizedData/Common/`);

                //Copy common file over
                fs.copyFileSync(`${WorkingDirectory}/project/Text/${TextContents[CurrentLang]}/ProjectData.szs`,
                `${WorkingDirectory}/romfs/LocalizedData/${TextContents[CurrentLang]}/ProjectData.szs`);

                continue;
            }

            //Create directories in romfs section
            fs.mkdirSync(`${WorkingDirectory}/romfs/LocalizedData/${TextContents[CurrentLang]}/MessageData/`, {recursive: true});

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
                console.log(`Completed SarcTool compression of ${TextContents[CurrentLang]}/${LangContainers[CurrentContainer]}`);

                //Copy this compressed file over to the romfs
                fs.copyFileSync(`${WorkingDirectory}/project/Text/${TextContents[CurrentLang]}/${LangContainers[CurrentContainer]}.szs`,
                `${WorkingDirectory}/romfs/LocalizedData/${TextContents[CurrentLang]}/MessageData/${LangContainers[CurrentContainer]}.szs`);
                
                //Delete compressed version from the project folder
                fs.removeSync(`${WorkingDirectory}/project/Text/${TextContents[CurrentLang]}/${LangContainers[CurrentContainer]}.szs`);
            }
        }

        //////////////////////////
        //Cleanup SoundData Folder
        //////////////////////////

        //Alert console
        console.log(`Cleaning up SoundData folder...`);

        //Read all files in SoundData folder
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
            }
        }

        /////////////////////////
        //Update ProjectData.json
        /////////////////////////
        
        //Alert console
        console.log(chalk.green.bold(`Complete! Updating Project Information...`));

        //Update time
        Time = new Date();
        ProjectData.DumpStats.Time = (Time.getMonth()+1)+'-'+Time.getDate()+'-'+Time.getFullYear()+' '+
        Time.getHours()+":"+Time.getMinutes()+":" +Time.getSeconds();

        //Update Type
        if(FullBuild){
            ProjectData.DumpStats.Type = `Full`;
        } else {
            ProjectData.DumpStats.Type = `Quick`;
        }

        //Update has been dumped
        ProjectData.DumpStats.isUndumped = false;

        //Increment Amount Of Dumps
        ProjectData.DumpStats.Amount++;

        //Write changes to file
        jsonfile.writeFileSync(WorkingDirectory+`/ProjectData.json`, ProjectData);

        //Return
        return ProjectData;
    }
}