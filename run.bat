@echo off

if exist %0\..\node_modules (
  title SMO Project Manager
  mode con: cols=85 lines=30
  start cmd.exe /c "title Starlight Server & mode con: cols=150 lines=35 & node %0\..\bin/tcp-subprocess.js"
  node %0\..\bin\index.js
) else (
  title SMO Project Manager - Initalization Tool
  echo Installing dependencies...
  echo Please verify you have the following installed:
  echo 	  Node
  echo 	  NPM
  echo 	  Python

  pause

  npm install
)

