// find src less file compile to css file
const { glob, globSync, globStream, globStreamSync, Glob } = require('glob');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const main = async () => {
  const lessfiles = await glob(
    path.join(__dirname, '../src/app/network-dao/proposal-detail/**/*.less'),
  );
  lessfiles.forEach((lessFile) => {
    const filePath = lessFile.slice(0, -5);
    const cmd = `npx lessc ${lessFile} ${filePath}.css`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
  });
};

main();
