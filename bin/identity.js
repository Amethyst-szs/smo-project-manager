var fs = require('fs-extra');

module.exports = {
    GenerateKey: async function(OwnDirectory){
        //Remove the current unique_key.json if it exists
        if(fs.existsSync(`${OwnDirectory}save_data/unique_key.json`)){
            fs.removeSync(`${OwnDirectory}save_data/unique_key.json`);
        }

        let CurrentTime = new Date();

        Key = {};
        Key.Main = (Math.round(Math.random()*100000)*Math.round(Math.random()*100000)*CurrentTime.getMilliseconds()*CurrentTime.getSeconds()).toString(36);

        fs.writeJSONSync(`${OwnDirectory}/save_data/unique_key.json`, Key);
    }
}