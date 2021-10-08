var fs = require('fs-extra');
const input = require("input");

async function NewDirectoryCreator(Drive, Path){
    NewFolderName = await input.text(`What should this new folder be named? `);
    if (!fs.existsSync(Drive+Path+`/${NewFolderName}`)){
        fs.mkdirSync(Drive+Path+`/${NewFolderName}`);
    }

    return Path+`/${NewFolderName}`;
}

module.exports = {
    DriveSelect: async function(){
        let Options = [`C`, `D`, `E`, `F`, `G`, `H`, `I`];
        let ExistDrives = [];

        for(i=0;i<Options.length;i++){
            if (fs.pathExistsSync(`${Options[i]}:`)) { ExistDrives.push(Options[i]); }
        }

        if(ExistDrives.length == 1) {
            return ExistDrives[0]+`:`;
        } else {
            return await input.select(`Which drive would you like to use?`, ExistDrives)+`:`;
        }
    },

    MainExplorer: async function(Drive, Path, isAutoSelect, isProjectStarter){
        Complete = false;
        MadeSelection = false;

        while(!Complete){
            console.clear();
            let AdditonalOptions = [`<-- Back`];
            if(!isAutoSelect) { AdditonalOptions = AdditonalOptions.concat([`--> Select This Folder`, `<-> Make A New Folder`]); }

            CurrentPathCont = fs.readdirSync(`${Drive}/${Path}`);
            // for(i=0;i<CurrentPathCont.length;i++){
            //     CurrentStats = fs.statSync(Drive+Path+`/`+CurrentPathCont[i])
            //     if(CurrentStats.isFile()){ CurrentPathCont.splice(i, 1); }
            // }
            
            SelectionMenu = AdditonalOptions.concat(CurrentPathCont);
            Select = await input.select(`Select your folder:\nCurrent Path: ${Path}`, SelectionMenu);

            switch(Select){
                case `<-- Back`:
                    if(!Path.includes(`/`)){
                        return `NA`;
                    }
                    Path = Path.slice(0, Path.lastIndexOf(`/`));
                    break;
                case `--> Select This Folder`:
                    return Drive+Path+`/`;
                    break;
                case `<-> Make A New Folder`:
                    Path = await NewDirectoryCreator(Drive, Path);
                    break;
                default:
                    Path += `/`+Select;

                    if(isProjectStarter && fs.existsSync(Drive+Path+`/ProjectData.json`)){
                        if(isAutoSelect){
                            return Drive+Path+`/`;
                        } else {
                            console.clear();
                            menu = require('./menu');
                            console.log(`A project already exists in this folder!\nPlease select another folder`);
                            await menu.GenericConfirm();
                            Path = Path.slice(0, Path.length-(Select.length+1));
                        }
                    }
                    break;
            }
        }
    }
}