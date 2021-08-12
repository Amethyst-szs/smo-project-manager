const chalk = require("chalk");
const fs = require('fs-extra');
const directories = require('../directories.json');
const menu = require('./menu');

let isCancel = false;

module.exports = {
    NewLang: function(WorkingDirectory, LangSelection){
        //Setup console
        console.clear();
        console.log(chalk.yellowBright.bold(`Adding new language to project...`));

        ///////////////////
        //Check for isssues
        ///////////////////

        // Check if the requested language is already added
        ProjectTextDir = fs.readdirSync(`${WorkingDirectory}/project/Text/`);

        for(i=0;i<ProjectTextDir.length;i++){
            if(ProjectTextDir[i] == LangSelection){
                console.log(chalk.redBright.bold(`This language is already added!`));
                isCancel = true;
            }
        }

        // Check that the requested language isn't "Common"
        if(LangSelection == `Common`){
            console.log(chalk.redBright.bold(`Common is not a typical language.\nIf you want to add the common folder, copy it manually!`));
            isCancel = true;
        }

        //If cancelled, return here
        if(isCancel) { return; }

        /////////////////////
        //Copy language files
        /////////////////////

        //Make new directory in project
        fs.mkdirSync(`${WorkingDirectory}/project/Text/${LangSelection}/`);

        //Copy files
        SMOSourceLang = fs.readdirSync(`${directories.SMODirectory}/LocalizedData/${LangSelection}/MessageData/`);
        for(i=0;i<SMOSourceLang.length;i++){
            fs.copyFileSync(`${directories.SMODirectory}/LocalizedData/${LangSelection}/MessageData/${SMOSourceLang[i]}`,
            `${WorkingDirectory}/project/Text/${LangSelection}/${SMOSourceLang[i]}`);
        }
    }
}