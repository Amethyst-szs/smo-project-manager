//Requirements
const fs = require('fs');
const chalk = require('chalk');
const ftp = require("basic-ftp");
const menu = require('./menu');

let SMOPath = `/atmosphere/contents/0100000000010000/romfs`;
let isFTPValid = false;

module.exports = {
    FTPSyncCheck: async function(FTPAccessObject){
        console.log(FTPAccessObject);
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
                for(i=0;i<SelectedFolders.length;i++){
                    //Before uploading contents of this selected folder to server, check if the current one needs to be deleted
                    for(i2=0;i2<ExistingFolders.length;i2++){
                        if(SelectedFolders[i] == ExistingFolders[i2].name){
                            await client.removeDir(`${SMOPath}/${SelectedFolders[i]}`);
                        }
                    }
                    //Now the current selected folder can be uploaded
                    console.log(`Uploading ${SelectedFolders[i]} to server...`);
                    await client.ensureDir(`${SMOPath}/${SelectedFolders[i]}`);
                    await client.uploadFromDir(`${WorkingDirectory}/romfs/${SelectedFolders[i]}`);
                    await client.cdup();
                }
                console.log(chalk.cyanBright.bold(`Successful transfer!`));
            }
        }
        catch(err) {
            console.log(chalk.redBright.bold.underline(`Error!`))
            console.log(err)
        }
        client.close()
    },

    FTPClearRomfs: async function(FTPAccessObject){
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
                for(i=0;i<ExistingFolders.length;i++){
                    await client.removeDir(`${SMOPath}/${ExistingFolders[i].name}`);
                    console.log(`Succesfully deleted ${ExistingFolders[i].name}`);
                }
                console.log(chalk.cyanBright.bold(`Successfully cleared RomFS folder contents`));
            }
        }
        catch(err) {
            console.log(chalk.redBright.bold.underline(`Error!`))
            console.log(err)
        }
        client.close()
    }
}