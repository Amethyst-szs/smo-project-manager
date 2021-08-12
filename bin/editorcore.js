var fs = require('fs-extra');
const chalk = require("chalk");

module.exports = {
    Refresh: function(WorkingDirectory){
        //Notify Console
        console.log(chalk.yellow.bold(`Refreshing EditorCore...`));

        //Locate ObjectData files
        ObjectDataContent = fs.readdirSync(`${WorkingDirectory}/romfs/ObjectData/`);
        for(i=0;i<ObjectDataContent.length;i++){
            if(fs.existsSync(`D:/NCA-NSP-XCI_TO_LayeredFS_v1.6/1.6/Super-Mario-Oddyesy/Odyssey1.2Dump/ObjectData/${ObjectDataContent[i]}`)){
                fs.removeSync(`D:/NCA-NSP-XCI_TO_LayeredFS_v1.6/1.6/Super-Mario-Oddyesy/Odyssey1.2Dump/ObjectData/${ObjectDataContent[i]}`);
            }
            fs.copyFileSync(`${WorkingDirectory}/romfs/ObjectData/${ObjectDataContent[i]}`,
            `D:/NCA-NSP-XCI_TO_LayeredFS_v1.6/1.6/Super-Mario-Oddyesy/Odyssey1.2Dump/ObjectData/${ObjectDataContent[i]}`);
        }

        fs.removeSync(`D:/NCA-NSP-XCI_TO_LayeredFS_v1.6/1.6/Super-Mario-Oddyesy/Release/OdysseyModels/`);
    }
}