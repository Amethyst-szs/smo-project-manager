# Super Mario Odyssey - Project Manager
This is an early WIP tool to make your life with Odyssey modding less painful!  
When starting the program, make sure to run "init.bat" to install dependencies first. Then you can use "run.bat"!

### Dependencies
-Node  
-NPM  
-Python  

### (Current) Features
-Automatically create SMO mod folder structure  
-Allows sub-folders to organize mods  
-Automatically refresh EditorCore with custom models  
-Keep text data uncompressed, the program automatically compresses the files with SarcTool on build  
-Use template objects  
-Add new languages in your project with the push of a button

### Adding to your right click menu
If you want to quickly be able to open a project on windows, open the Registry Editor. Inside here, go through the directories: `HKEY_CLASSES_ROOT/Directory/Background/shell/`. Add a new key called "SMO Project Manager". Inside this key, add a new key called "command". Add a new string value to this key called "(Default)" with the value pointing to your "run.bat" file, like this `D:\GitHub\Repos\smo-project-manager/run.bat`.  
Hopefully in the future this process can be automatted!

### Credits
aboood40091 - Developer of SarcTool  
