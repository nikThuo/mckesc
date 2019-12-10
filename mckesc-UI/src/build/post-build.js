const path = require('path');
const fs = require('fs');
const util = require('util');

// get application version from package.json
var appVersion = require('../../package.json').version;
var previousHash = require('./version.json').hash;

// promisify core API's
const readDir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

console.log('\nRunning post-build tasks');

// our version.json will be in the mckesc folder
const versionFilePath = path.join(__dirname + '/../../mckesc/version.json');
const versionFilePath2 = path.join(__dirname + '/version.json');

let mainHash = '';
let mainBundleFile = '';

// RegExp to find main.bundle.js, even if it doesn't include a hash in it's name (dev build)
let mainBundleRegexp = /^main.?([a-z0-9]*)?(\.bundle)?.js$/;

// read the mckesc folder files and find the one we're looking for
readDir(path.join(__dirname, '../../mckesc/'))
  .then(files => {
    mainBundleFile = files.find(f => mainBundleRegexp.test(f));
    if (mainBundleFile) {
      let matchHash = mainBundleFile.match(mainBundleRegexp);
      // if it has a hash in it's name, mark it down
      if (matchHash.length > 1 && !!matchHash[1]) {
        mainHash = matchHash[1];
      }
    }
    console.log(`Writing version and hash to ${versionFilePath}`);
    // write current version and hash into the version.json file
    const src = `{"version": "${appVersion}", "hash": "${mainHash}"}`;
    return writeFile(versionFilePath, src);
  }).then(() => {
    // main bundle file not found, dev build?
    if (!mainBundleFile) {
      return;
    }
    console.log(`Replacing hash in the ${mainBundleFile}`);
    // replace hash placeholder in our main.js file so the code knows it's current hash
    const mainFilepath = path.join(__dirname, '../../mckesc/', mainBundleFile);
    return readFile(mainFilepath, 'utf8')
      .then(mainFileData => {
        const replacedFile = mainFileData.replace('{{POST_BUILD_ENTERS_HASH_HERE}}', mainHash);
        return writeFile(mainFilepath, replacedFile);
      });
  }).catch(err => {
    console.log('Error with post build:', err);
  });

// update version-check.service.ts
readDir(path.join(__dirname, '../app/services/version-check/'))
  .then(files => {
    const versionCheckServicePath = path.join(__dirname, '../app/services/version-check/', 'version-check.service.ts');
    console.log(`Updating version-check.service.ts hash`);
    return readFile(versionCheckServicePath, 'utf8')
      .then(versionCheckServiceData => {
        if (versionCheckServiceData.includes('{{POST_BUILD_ENTERS_HASH_HERE}}')) {
          const replacedFile = versionCheckServiceData.replace('{{POST_BUILD_ENTERS_HASH_HERE}}', mainHash);
          return writeFile(versionCheckServicePath, replacedFile);
        }else{
          const replacedFile = versionCheckServiceData.replace(previousHash, mainHash);
          return writeFile(versionCheckServicePath, replacedFile);
        }
      });
  }).catch(err => {
    console.log('Error updating version-check.service.ts:', err);
  });

// auto increase the version in package.json
readDir(path.join(__dirname, '../'))
  .then(files => {
    const packageFilepath = path.join(__dirname, '../../', 'package.json');
    return readFile(packageFilepath, 'utf8')
      .then(packageFileData => {
        let values = appVersion.split('.');
        values[2] = parseInt(values[2]) + 1;
        newAppVersion = values.join('.');
        console.log(`Updating to version ${appVersion} to ${newAppVersion}`);
        const replacedFile = packageFileData.replace(appVersion, newAppVersion);
        return writeFile(packageFilepath, replacedFile);
      });
  }).catch(err => {
    console.log('Error updating the version::', err);
  });

readDir(path.join(__dirname, './'))
  .then(files => {
    mainBundleFile = files.find(f => mainBundleRegexp.test(f));
    if (mainBundleFile) {
      let matchHash = mainBundleFile.match(mainBundleRegexp);
      if (matchHash.length > 1 && !!matchHash[1]) {
        mainHash = matchHash[1];
      }
    }
    const src = `{"version": "${appVersion}", "hash": "${mainHash}"}`;
    return writeFile(versionFilePath2, src);
  }).catch(err => {
    console.log('Error last part:', err);
  });