const chalk = require("chalk");
var fs = require('fs');

module.exports = {
    CopyFiles: function(WorkingDirectory, SelectedObjects){
        for(i=0;i<SelectedObjects.length;i++){
            fs.copyFileSync(`D:/JS/SMOProjectManager/templateszs/${SelectedObjects[i]}`,
            `${WorkingDirectory}/project/Objects/${SelectedObjects[i]}`);
        }
    }
}