const chalk = require("chalk");
const fs = require('fs-extra');
const directories = require('../directories.json');
const menu = require('./menu');
const { execSync } = require('child_process');

let isCancel = false;

module.exports = {
    NewLang: function(WorkingDirectory, LangSelection, OwnDirectory){
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
        console.log(chalk.greenBright.bold(`Confirmed valid language to add!`));
        SMOSourceLang = fs.readdirSync(`${directories.SMODirectory}/LocalizedData/${LangSelection}/MessageData/`);
        for(i=0;i<SMOSourceLang.length;i++){
            fs.copyFileSync(`${directories.SMODirectory}/LocalizedData/${LangSelection}/MessageData/${SMOSourceLang[i]}`,
            `${WorkingDirectory}/project/Text/${LangSelection}/${SMOSourceLang[i]}`);
            console.log(chalk.green.bold(`Added ${SMOSourceLang[i]} from ${LangSelection} to project`));
        }

        ////////////////////
        //Extract text files
        ////////////////////
        
        for(i=0;i<SMOSourceLang.length;i++){
            //Run SarcTool on current text file
            execSync(`${OwnDirectory}sarctool/sarc_tool.exe ${WorkingDirectory}/project/Text/${LangSelection}/${SMOSourceLang[i]}`, (err, stdout, stderr) => {
                if (err) {
                  console.log(chalk.red.bold(`SarcTool Error!`));
                  return;
                }
            });
            console.log(chalk.green.bold(`Successfully decompressed ${SMOSourceLang[i]} from ${LangSelection}`));

            //Delete old compressed files
            fs.removeSync(`${WorkingDirectory}/project/Text/${LangSelection}/${SMOSourceLang[i]}`);
            console.log(chalk.green.bold(`Successfully deleted compressed ${SMOSourceLang[i]} from ${LangSelection}`));
        }

        console.log(chalk.cyanBright.bold(`\nCompleted adding language files!\nCheck Text folder for files`));
        
        //Complete!
        return;
    }
}