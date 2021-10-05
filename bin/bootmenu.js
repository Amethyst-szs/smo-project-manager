const input = require("input");
const chalk = require("chalk");
const boxen = require('boxen');
var fs = require('fs-extra');

module.exports = {
    MainSelection: async function(FunctionalDirectories){
        MenuChoices = [];
        if(!FunctionalDirectories){
            MenuChoices = [
            `Edit Directories`,
            `Quit`];
        } else {
            MenuChoices = [
            `Create New Project`,
            `Load Project`,
            `Edit Directories`,
            `Quit`];
        }

        return await input.select(`Boot Menu:`, MenuChoices);
    }
}