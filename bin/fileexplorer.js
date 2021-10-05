var fs = require('fs-extra');
const input = require("input");

module.exports = {
    DriveSelect: async function(){
        //Let the user select a drive
        //For now, just return "C:/"
        return "C:";
    },

    MainExplorer: async function(Drive, Path){
        Complete = false;
        MadeSelection = false;

        while(!Complete){
            console.clear();
            let Dummy = new Array()
            AdditonalOptions = [`<-- Back`, `--> Select This Folder`];
            CurrentPathCont = fs.readdirSync(`${Drive}/${Path}`);
            for(i=0;i<CurrentPathCont.length;i++){
                if(CurrentPathCont[i].includes(`.`)){ CurrentPathCont.splice(i, 1); }
            }
            
            SelectionMenu = AdditonalOptions.concat(CurrentPathCont);
            Select = await input.select(`Select your folder:\nCurrent Path: ${Path}`, SelectionMenu);

            switch(Select){
                case `<-- Back`:
                    Path = Path.slice(0, Path.lastIndexOf(`/`));
                    break;
                case `--> Select This Folder`:
                    return Drive+Path+`/`;
                    break;
                default:
                    Path += `/`+Select;
                    break;
            }
        }
    }
}