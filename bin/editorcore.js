var fs = require('fs-extra');
const chalk = require("chalk");
const Directories = require('../save_data/directories.json');

module.exports = {
    Refresh: function(WorkingDirectory){
        //Notify Console
        console.log(chalk.yellow.bold(`Refreshing EditorCore...`));
        console.time(`Duration`);

        //Check if ObjectDataOverride is active and correct
        let isUseOverride = false;
        if(Directories.Optional.ObjectDataOverride != ``){
            isUseOverride = fs.existsSync(Directories.Optional.ObjectDataOverride+`/Mario.szs`);
        }
        
        console.log(chalk.yellowBright(`Using ObjectDataOverride: ${isUseOverride}`));

        //Locate ObjectData files
        ObjectDataContent = fs.readdirSync(`${WorkingDirectory}/romfs/ObjectData/`);
        for(i=0;i<ObjectDataContent.length;i++){
            if(isUseOverride){
                if(fs.existsSync(`${Directories.Optional.ObjectDataOverride}/${ObjectDataContent[i]}`)){
                    fs.removeSync(`${Directories.Optional.ObjectDataOverride}/${ObjectDataContent[i]}`);
                }
                fs.copyFileSync(`${WorkingDirectory}/romfs/ObjectData/${ObjectDataContent[i]}`,
                `${Directories.Optional.ObjectDataOverride}/${ObjectDataContent[i]}`);
            } else {
                if(fs.existsSync(`${Directories.SMODirectory}/ObjectData/${ObjectDataContent[i]}`)){
                    fs.removeSync(`${Directories.SMODirectory}/ObjectData/${ObjectDataContent[i]}`);
                }
                fs.copyFileSync(`${WorkingDirectory}/romfs/ObjectData/${ObjectDataContent[i]}`,
                `${Directories.SMODirectory}/ObjectData/${ObjectDataContent[i]}`);
            }
        }

        fs.removeSync(`${Directories.EditorCore}/OdysseyModels/`);

        console.timeEnd(`Duration`);
    }
}