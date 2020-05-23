# Tagalogy

Mobile web game aimed to help players understand Tagalog more.

## Play it

- Web Browser: <https://tagalogy.herokuapp.com/>
- Play Store: (Will be available soon)
- App Store: (Will be available soon)

## Made for Thesis

This project is made for Thesis _Tagalogy: Applikasyon para sa Wikang Tagalog_ documented by Bagongon, Lontok, and Zorilla.

## Development

This section is intended for those who want to locally install and modify this project. If you just want to play Tagalogy, install it from available options at [Play it](#play-it) section.

Tagalogy is a web game that uses PWA technology. The main source code is written in TypeScript. It uses Rollup.JS and various plugin to bundle these to a single distribution code.

This section also assumes that the current directory of your terminal is in the copy of Tagalogy.

### TODOS

- [ ] Migrate to Prettier
- [ ] Migrate to WebPack

### Dependencies

- [Node.JS](https://nodejs.org/)
- [Git](https://git-scm.com/)

### Installation

[Node.JS](https://nodejs.org/) and [Git](https://git-scm.com/) must be installed first. Then run the following command. The current directory should be where you want to install a copy of Tagalogy.

```shell
git clone https://github.com/tagalogy/tagalogy.git
cd tagalogy
npm install
```

This will also install other dependencies.

### Starting

Run the following command.

```shell
npm start
```

You should be able to play Tagalogy at port 4000 (at url `http://localhost:4000/`). You can configure the port with the `PORT` environment variable or just simply modify the `start.js`.

You could alternatively directly open `public/index.html`. Due to restriction with local html files, service worker and local storage is disabled for this setup.

### Testing

Run the following command.

```shell
npm test
```

With small delay, this updates or builds the distribution code as you edit and save the TypeScript files. These distribution code will have source mapping so you can debug right within the source code.

You need to [start Tagalogy](#starting) as well so you can play the modified Tagalogy.

### Building

Upon installation, the distribution code is built with optimized size. However, when you use the [testing functionality](#testing), these codes have no longer optimized size, which is necessary for debugging. You can rebuild again with optimized size with the following command.

```shell
npm run build
```
