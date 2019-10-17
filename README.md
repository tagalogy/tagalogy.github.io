# Tagalogy
Mobile-first web game aimed to help players understand Tagalog more. Developed by Sean Bagongon.

## Play it
- Web Browser: https://tagalogy.herokuapp.com/
- Play Store: (Will be available soon)
- App Store: (Will be available soon)

## Installation & Contribution
_This instruction is for those who wish to contribute and modify a fork of this project._

This project is tested on NodeJS v10.16.3+ and NPM v6.9.0+, install it at [nodejs.org](https://nodejs.org/). You need to have a fork if this project as well. Run the following command, make sure the current directory is on the project.
```
npm install
npm start
```
You should be able to play Tagalogy on port 4000.

When you made changes to client-side javascript from `/src/` you should update the `/src_min/main.js` before testing. You can use rollup, the config file is already in this project. Run the following command, this assumes you have globally installed rollup.
```
rollup --config
```
You can delete `/src_min/`, the client will work fine and load `/src/main.js`. However, files in `/src/` aren't cached in service worker.

## Made for Thesis
This project is made for Thesis _Tagalogy: Pampagkatutong Aplikasyon_ documented by Bagongon, Emmanuel, and Zorilla. Download and read it [here](about:blank).
