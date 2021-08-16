@echo off

if exist %0\..\node_modules (
  title SMO Project Manager
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

