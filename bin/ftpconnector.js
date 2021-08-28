//Requirements
const fs = require('fs');
const chalk = require('chalk');
const ftp = require("basic-ftp");
const menu = require('./menu');

let SMOPath = `/atmosphere/contents/0100000000010000/romfs`;
let isFTPValid = false;

function UpdateConsole(Label, Progress, TotalTasks){
    console.clear();
    console.log(chalk.red.bold(`Transfering files to console...\nDon't close the program, alter any files, or turn off the console\n`));
    menu.ProgressBar(Label, Progress, TotalTasks);
}

module.exports = {
    FTPSyncCheck: async function(FTPAccessObject){
        const client = new ftp.Client()
        client.ftp.verbose = false
        try {
            await client.access(FTPAccessObject)
            console.log(chalk.greenBright.bold.underline(`Successfully connected! Checking connection status...`));
            await client.ensureDir(SMOPath);
            if(await client.pwd() == SMOPath){
                console.log(chalk.greenBright.bold.underline(`Confirmed connections are valid!`));
                isFTPValid = true;
            } else {
                console.log(chalk.redBright.bold.underline(`Issue found! You might not have made your ${SMOPath} yet?`));
                isFTPValid = false;
            }
        }
        catch(err) {
            console.log(chalk.redBright.bold.underline(`Error connecting!`))
            console.log(err)
        }
        client.close()
        await menu.GenericConfirm()
        return isFTPValid;
    },

    FTPTransferProject: async function(WorkingDirectory, SelectedFolders, FTPAccessObject){
        if(SelectedFolders == []) { return; }

        console.time(`Duration`);

        const client = new ftp.Client()
        client.ftp.verbose = false
        try {
            await client.access(FTPAccessObject)
            console.log(chalk.greenBright.bold.underline(`Successfully connected! Starting transfer...`));
            //Already confirmed directory exists during sync process, just enter that directory
            await client.cd(SMOPath);

            if(await client.pwd() == SMOPath){
                console.log(chalk.greenBright.bold.underline(`Entered ${SMOPath} on server`));
                //Get a list of all files in SMOPath
                ExistingFolders = await client.list(`${SMOPath}`);
                TotalTasks = SelectedFolders.length+1;

                client.trackProgress(info => {
                    UpdateConsole(`Sending ${SelectedFolders[i]} to server...\n${info.name} - ${info.bytes}`, i+1, TotalTasks);
                })

                for(i=0;i<SelectedFolders.length;i++){
                    //Before uploading contents of this selected folder to server, check if the current one needs to be deleted
                    for(i2=0;i2<ExistingFolders.length;i2++){
                        if(SelectedFolders[i] == ExistingFolders[i2].name){
                            await client.removeDir(`${SMOPath}/${SelectedFolders[i]}`);
                        }
                    }
                    //Now the current selected folder can be uploaded
                    UpdateConsole(`Sending ${SelectedFolders[i]} to server...`, i+1, TotalTasks);
                    await client.ensureDir(`${SMOPath}/${SelectedFolders[i]}`);
                    await client.uploadFromDir(`${WorkingDirectory}/romfs/${SelectedFolders[i]}`);
                    await client.cdup();
                }
                UpdateConsole(`Completed transfer!`, TotalTasks, TotalTasks);
            }
        }
        catch(err) {
            console.log(chalk.redBright.bold.underline(`Error!`))
            console.log(err)
        }
        client.trackProgress()
        console.timeEnd(`Duration`);
        client.close()
    },

    FTPClearRomfs: async function(FTPAccessObject){
        console.time(`Duration`);

        const client = new ftp.Client()
        client.ftp.verbose = false
        try {
            await client.access(FTPAccessObject)
            console.log(chalk.greenBright.bold.underline(`Successfully connected! Will delete RomFS contents shortly...`));
            //Already confirmed directory exists during sync process, just enter that directory
            await client.cd(SMOPath);
            
            if(await client.pwd() == SMOPath){
                console.log(chalk.greenBright.bold.underline(`Entered ${SMOPath} on server`));
                //Get a list of all files in SMOPath
                ExistingFolders = await client.list(`${SMOPath}`);
                TotalTasks = ExistingFolders.length+1;
                for(i=0;i<ExistingFolders.length;i++){
                    await client.removeDir(`${SMOPath}/${ExistingFolders[i].name}`);
                    UpdateConsole(`Deleting ${ExistingFolders[i].name} on server...`, i+1, TotalTasks);
                }

                UpdateConsole(`Emptied RomFS on server!`, TotalTasks, TotalTasks);
            }
        }
        catch(err) {
            console.log(chalk.redBright.bold.underline(`Error!`))
            console.log(err)
        }
        console.timeEnd(`Duration`);
        client.close()
    }
}