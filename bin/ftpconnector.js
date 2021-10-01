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

    FTPTransferProject: async function(WorkingDirectory, ChangedFiles, FTPAccessObject){
        if(ChangedFiles == []) { return; }

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
                ExistingServerFolders = await client.list(`${SMOPath}`);
                ExistingLocalFolders = fs.readdirSync(`${WorkingDirectory}/romfs/`);
                TotalTasks = ChangedFiles.length+2;

                client.trackProgress(info => {
                    UpdateConsole(`Sending ${info.name.slice(38, info.name.length)} to server - ${info.bytes/1000}KBs`,
                    TotalTasks-ChangedFiles.length, TotalTasks);
                })

                //Start by verifying all folders needed are on server
                for(CurrentLocalFolder of ExistingLocalFolders){
                    if(!ExistingServerFolders.includes(CurrentLocalFolder)){
                        await client.ensureDir(`${SMOPath}/${CurrentLocalFolder}`);
                        await client.cdup();
                    }
                }

                // Now do that the other way. If folders are on server that aren't on local, remove from server
                for (CurrentServerFolder of ExistingServerFolders) {
                    if(!ExistingLocalFolders.includes(CurrentServerFolder.name)){
                        await client.removeDir(`${SMOPath}/${CurrentServerFolder.name}`);
                    }
                }

                // Now start going through the server folders and copying new files over
                ExistingServerFolders = await client.list(`${SMOPath}`);
                for (CurrentServerFolder of ExistingServerFolders) {
                    await client.cd(`${SMOPath}/${CurrentServerFolder.name}`);
                    CurrentContents = fs.readdirSync(`${WorkingDirectory}/romfs/${CurrentServerFolder.name}/`);
                    for (CurrentFile of CurrentContents) {
                        if(ChangedFiles.includes(CurrentFile)){
                            await client.uploadFrom(`${WorkingDirectory}/romfs/${CurrentServerFolder.name}/${CurrentFile}`,
                            `${SMOPath}/${CurrentServerFolder.name}/${CurrentFile}`);
                            ChangedFiles.splice(ChangedFiles.indexOf(CurrentFile), 1);
                        }
                    }
                }

                //Stop automatically tracking the transfer progress
                client.trackProgress()
                UpdateConsole(`Finalizing LocalizedData...`, TotalTasks-1, TotalTasks);

                //Lastly, move LocalizedData over IF "LocalizedDataHandler" remains in ChangedFiles
                if(ChangedFiles.includes(`LocalizedDataHandler`)){
                    await client.uploadFromDir(`${WorkingDirectory}/romfs/LocalizedData/`, `${SMOPath}/LocalizedData/`);
                }

                UpdateConsole(`Completed transfer!`, TotalTasks, TotalTasks);
            }
        }
        catch(err) {
            console.log(chalk.redBright.bold.underline(`Error!`))
            console.log(err)
        }

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