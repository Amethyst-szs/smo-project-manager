var fs = require('fs-extra');
const chalk = require("chalk");
const Directories = require('../directories.json');

module.exports = {
    Refresh: function(WorkingDirectory){
        //Notify Console
        console.log(chalk.yellow.bold(`Refreshing EditorCore...`));

        //Locate ObjectData files
        ObjectDataContent = fs.readdirSync(`${WorkingDirectory}/romfs/ObjectData/`);
        for(i=0;i<ObjectDataContent.length;i++){
            if(fs.existsSync(`${Directories.SMODirectory}/ObjectData/${ObjectDataContent[i]}`)){
                fs.removeSync(`${Directories.SMODirectory}/ObjectData/${ObjectDataContent[i]}`);
            }
            fs.copyFileSync(`${WorkingDirectory}/romfs/ObjectData/${ObjectDataContent[i]}`,
            `${Directories.SMODirectory}/ObjectData/${ObjectDataContent[i]}`);
        }

        fs.removeSync(`${Directories.EditorCore}/OdysseyModels/`);
    }
}