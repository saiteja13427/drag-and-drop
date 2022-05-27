# Drag And Drop

A simple OOP based drag and drop project built using typescript and some of its amazing features like
Decorators, Generic Types etc.

This project also uses **webpack** wherein webpack compiles Typescript to Javascript, it bundles it and minifies it and stores it in a dist folder.

## How To Run?
Following are the steps to run the project

1. Clone the respository `git clone git@github.com:saiteja13427/drag-and-drop.git`
2. Navigate into the project folder.
3. Run `npm i`
4. After that there are two choices. Either compile typescript into js by executing `tsc` but you will have to change script src in index.html to 'dist/app.js'. Second choice is you can generate a bundle js file by executing `npm build` which uses webpack to transform ts file to a bundles and minified js file.
5. Run `npm start` to start the lite-server
6. It will open a tab with this project in your browser.