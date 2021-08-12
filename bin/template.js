const chalk = require("chalk");
var fs = require('fs');

module.exports = {
    CopyFiles: function(WorkingDirectory, SelectedObjects, OwnDirectory){
        for(i=0;i<SelectedObjects.length;i++){
            fs.copyFileSync(`${OwnDirectory}templateszs/${SelectedObjects[i]}`,
            `${WorkingDirectory}/project/Objects/${SelectedObjects[i]}`);
        }
    }
}