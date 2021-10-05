const chalk = require("chalk");
const version = require('../save_data/version.json')
var fs = require('fs-extra');

module.exports = {
    UpdateProject: function(WorkingDirectory, CurrentVersion){
        JSONObject = fs.readJSONSync(`${WorkingDirectory}/ProjectData.json`);

        //Songs Update
        if(!JSONObject.hasOwnProperty(`songs`)){
            JSONObject.songs = {};
        }

        //Unchanged File Checking Update
        if(!JSONObject.hasOwnProperty(`dates`)){
            JSONObject.dates = {};
        }

        //Project Name Update
        if(!JSONObject.hasOwnProperty(`PName`)){
            ProjectName = WorkingDirectory;
            console.log(ProjectName);
            JSONObject.PName = ProjectName.slice(ProjectName.slice(0, ProjectName.length-1).lastIndexOf(`\\`)+1, ProjectName.length);
        }

        //Set ProjectData to current version and save
        JSONObject.Version = parseInt(CurrentVersion, 10);
        fs.writeJSONSync(`${WorkingDirectory}/ProjectData.json`, JSONObject, {spaces: `\t`});

        return;
    },

    CreateProject: async function(WorkingDirectory){
        //Figure out project name from folder structure
        ProjectName = WorkingDirectory;
        ProjectName = ProjectName.slice(ProjectName.slice(0, ProjectName.length-1).lastIndexOf(`/`)+1, ProjectName.length-1);

        //Create JSON
        JSONObject = {
            Version: version.Version,
            PName: ProjectName,
            DumpStats: {
                Time: `N/A`,
                Amount: 0,
                isUndumped: true,
                Type: `N/A`
            },
            songs: {},
            dates: {}
        }

        //Write to JSON file
        fs.writeJSONSync(WorkingDirectory+`/ProjectData.json`, JSONObject, {spaces: `\t`});
        
        //Create shortcut to open project in folder
        fs.writeFileSync(`${WorkingDirectory}/${ProjectName}.smoproj`,
        `This file type is a shortcut to open your project. Please make all .smoproj files use "run.bat" from SMO Project Manager`);

        //Check if folder directories already exist
        isRomfsExists = fs.existsSync('romfs');
        isProjectExists = fs.existsSync('project');

        //Create directories
        if(!isRomfsExists){
            fs.mkdirSync(`${WorkingDirectory}/romfs`);
        }
        if(!isProjectExists){
            fs.mkdirSync(`${WorkingDirectory}/project`);
        }

        //Create sub-directories
        fs.mkdirSync(`${WorkingDirectory}/project/Stages`);
        fs.mkdirSync(`${WorkingDirectory}/project/Objects`);
        fs.mkdirSync(`${WorkingDirectory}/project/CubeMaps`);
        fs.mkdirSync(`${WorkingDirectory}/project/Sound`);
        fs.mkdirSync(`${WorkingDirectory}/project/Sound/stream`);
        fs.mkdirSync(`${WorkingDirectory}/project/Sound/prefetch`);
        fs.mkdirSync(`${WorkingDirectory}/project/Effects`);
        fs.mkdirSync(`${WorkingDirectory}/project/UI`);
        fs.mkdirSync(`${WorkingDirectory}/project/Text`);
        fs.mkdirSync(`${WorkingDirectory}/project/Video`);
        fs.mkdirSync(`${WorkingDirectory}/project/System`);
        fs.mkdirSync(`${WorkingDirectory}/project/Shaders`);
        fs.mkdirSync(`${WorkingDirectory}/project/Events`);
        fs.mkdirSync(`${WorkingDirectory}/project/AllUserContent`);
        fs.mkdirSync(`${WorkingDirectory}/project/AllUserContent/Models`);
        fs.mkdirSync(`${WorkingDirectory}/project/AllUserContent/Images`);
        fs.mkdirSync(`${WorkingDirectory}/project/AllUserContent/Sounds`);

        //Return with JSON data
        return JSONObject;
    }
}