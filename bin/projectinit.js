const chalk = require("chalk");
const jsonfile = require('jsonfile');
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

        //Set ProjectData to current version and save
        JSONObject.Version = parseInt(CurrentVersion, 10);
        fs.writeJSONSync(`${WorkingDirectory}/ProjectData.json`, JSONObject);

        return;
    },

    CreateProject: async function(WorkingDirectory){
        //Create JSON
        JSONObject = {
            Version: version.Version,
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
        jsonfile.writeFileSync(WorkingDirectory+`/ProjectData.json`, JSONObject);

        //Check if folder directories already exist
        isRomfsExists = fs.existsSync('romfs');
        isProjectExists = fs.existsSync('project');

        //Create directories
        if(!isRomfsExists){
            fs.mkdirSync('romfs');
        }
        if(!isProjectExists){
            fs.mkdirSync('project');
        }

        //Create sub-directories
        fs.mkdirSync('project/Objects');
        fs.mkdirSync('project/Stages');
        fs.mkdirSync('project/CubeMaps');
        fs.mkdirSync('project/Sound');
        fs.mkdirSync('project/Sound/stream');
        fs.mkdirSync('project/Sound/prefetch');
        fs.mkdirSync('project/Effects');
        fs.mkdirSync('project/UI');
        fs.mkdirSync('project/Text');
        fs.mkdirSync('project/Video');
        fs.mkdirSync('project/System');
        fs.mkdirSync('project/Shaders');
        fs.mkdirSync('project/Events');
        fs.mkdirSync('project/AllUserContent');
        fs.mkdirSync('project/AllUserContent/Models');
        fs.mkdirSync('project/AllUserContent/Images');
        fs.mkdirSync('project/AllUserContent/Sounds');

        //Return with JSON data
        return JSONObject;
    }
}