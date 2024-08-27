const fs = require('fs');

const DIR = '../src/assets/icons/';
const FILE_NAME = 'index.ts';
const FILE_PATH = DIR + FILE_NAME;

if (fs.existsSync(FILE_PATH)) fs.unlinkSync(FILE_PATH);

fs.readdir(DIR, function (err, files) {
  //handling error
  if (err) {
    return console.error('Unable to scan directory: ' + err);
  }
  //listing all files using forEach
  const FILES = [];
  files.forEach(function (file) {
    const filename = file.replace(/(.*)(\.svg)$/gi, '$1').toLowerCase();
    const componentName = filename
      .split(/-|_|\s/gi)
      .map((chunk) => toCapitalize(chunk))
      .join('');

    FILES.push({ filename, file, componentName });
  });

  FILES.forEach(({ componentName, file }) => {
    fs.appendFileSync(FILE_PATH, createImport(componentName, file));
  });

  fs.appendFileSync(FILE_PATH, '\nexport const icons = {\n');
  FILES.forEach(({ componentName, filename }) => {
    fs.appendFileSync(FILE_PATH, createObjectLine(filename, componentName));
  });
  fs.appendFileSync(FILE_PATH, '};\n');
});

function createImport(componentName, file) {
  return `import { ReactComponent as ${componentName} } from './${file}'\n`;
}

function createObjectLine(filename, componentName) {
  return `\t"${filename}": ${componentName},\n`;
}

function toCapitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
