const { spawn } = require('child_process');
const fs = require('fs');
// const { getConfig, getContractAddress } = require('./generate-config/queryConfig');

const APP_ENV = process.env.APP_ENV || 'testnet';
console.log('APP_ENV:', APP_ENV);

async function main() {
  if (APP_ENV === 'mainnet') {
    const fileConfigContent = fs.readFileSync('./src/config/index.ts', 'utf-8');
    let mainnetImportStatement = `export * from './mainnet';`;
    let testnetImportStatement = `export * from './testnet';`;
    const newFileContent = fileConfigContent.replace(
      testnetImportStatement,
      mainnetImportStatement,
    );
    fs.writeFileSync('./src/config/index.ts', newFileContent);
    console.log(`APP_ENV: ${APP_ENV}, replace testnet with mainnet !!!`);
    // await Promise.all([getConfig(), getContractAddress()]);
  }
  const env = Object.assign({}, process.env);
  // pass along the current process.env to maintain build flags from CI
  const buildCommand = spawn('yarn', [env.STANDALONE ? 'next:build' : 'next-compile'], {
    env,
  });

  buildCommand.stdout.on('data', (data) => {
    const output = data.toString();

    console.log(output);

    if (output.includes('Collecting build traces')) {
      setTimeout(() => {
        console.log('build success');
        buildCommand.kill('SIGKILL');
        process.exit(0);
      }, 5100);
    }
  });

  buildCommand.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  buildCommand.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if (code !== 0) {
      process.exit(1);
    }
  });
}
main().catch((error) => {
  console.log('build error', error);
});
