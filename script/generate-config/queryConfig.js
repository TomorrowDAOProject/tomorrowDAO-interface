// polyfill
global.location = {};
const AElf = require('aelf-sdk');
const fs = require('fs');
const path = require('path');
const config = require('../../src/app/network-dao/_src/config/config-testnet-aelf.json');
const originResult = JSON.parse(
  fs
    .readFileSync(
      path.resolve(
        __dirname,
        '../../src/app/network-dao/_src/config/viewer/config-testnet-aelf.json',
      ),
    )
    .toString(),
);
// const host = 'https://explorer.aelf.io/chain';

const commonPrivateKey = '0000000000000000000000000000000000000000000000000000000000000001';
const wallet = AElf.wallet.getWalletByPrivateKey(commonPrivateKey);
const result = {
  ...config,
};
async function getConfig(host, fileName) {
  const aelf = new AElf(new AElf.providers.HttpProvider(host));
  const { CONTRACTS, schemeIds } = config;
  const { ChainId, GenesisContractAddress } = await aelf.chain.getChainStatus();
  result.CHAIN_ID = ChainId;
  const zeroContract = await aelf.chain.contractAt(GenesisContractAddress, wallet);
  for (const [key, name] of Object.entries(CONTRACTS)) {
    const contractAddress = await zeroContract.GetContractAddressByName.call(
      AElf.utils.sha256(name),
    );
    result[key] = contractAddress;
    if (name === 'AElf.ContractNames.Token') {
      const contract = await aelf.chain.contractAt(contractAddress, wallet);
      const { symbol } = await contract.GetNativeTokenInfo.call();
      let resourceTokens = await contract.GetResourceTokenInfo.call();
      resourceTokens = Array.isArray(resourceTokens.value)
        ? resourceTokens.value.map(({ symbol, decimals }) => ({ symbol, decimals }))
        : [];
      result.SYMBOL = symbol;
      result.resourceTokens = resourceTokens;
    }
  }
  if (result.electionContractAddr) {
    const profit = await aelf.chain.contractAt(result.profitContractAddr, wallet);
    const electionSchemeIds = (
      await profit.GetManagingSchemeIds.call({
        manager: result.electionContractAddr,
      })
    ).schemeIds;
    const treasurySchemaIds = (
      await profit.GetManagingSchemeIds.call({
        manager: result.dividends,
      })
    ).schemeIds;
    const schemes = [
      electionSchemeIds[1],
      electionSchemeIds[0],
      treasurySchemaIds[3],
      treasurySchemaIds[2],
      treasurySchemaIds[4],
    ].map((v, i) => ({
      type: schemeIds[i].type,
      schemeId: v,
    }));
    result.schemeIds = schemes;
  }
  result.genesisContract = GenesisContractAddress;
  fs.writeFileSync(
    path.resolve(__dirname, `../../src/app/network-dao/_src/config/${fileName}`),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  console.log('writeFileSync', `config/${fileName}`);
}

async function getContractAddress(host, fileName) {
  // less than config.CONTRACTS
  const contractNames = [
    {
      name: 'Token',
      description: 'contract Token',
      contractName: 'AElf.ContractNames.Token',
    },
    {
      name: 'Dividend',
      description: 'contract Dividend',
      contractName: 'AElf.ContractNames.Treasury',
    },
    {
      name: 'Consensus.Dpos',
      description: 'contract Consensus',
      contractName: 'AElf.ContractNames.Consensus',
    },
    {
      name: 'Token Converter',
      description: 'contract Token Converter',
      contractName: 'AElf.ContractNames.TokenConverter',
    },
    {
      name: 'Election',
      description: 'contract Election',
      contractName: 'AElf.ContractNames.Election',
    },
    {
      name: 'Profit',
      description: 'contract Profit',
      contractName: 'AElf.ContractNames.Profit',
    },
    {
      name: 'Parliament',
      description: 'contract Parliament',
      contractName: 'AElf.ContractNames.Parliament',
    },
    {
      name: 'Association',
      description: 'contract Association',
      contractName: 'AElf.ContractNames.Association',
    },
    {
      name: 'Referendum',
      description: 'contract Referendum',
      contractName: 'AElf.ContractNames.Referendum',
    },
    {
      name: 'CrossChain',
      description: 'contract CrossChain',
      contractName: 'AElf.ContractNames.CrossChain',
    },
  ];

  const aelf = new AElf(new AElf.providers.HttpProvider(host));
  const wallet = AElf.wallet.createNewWallet();
  const { ChainId, GenesisContractAddress } = await aelf.chain.getChainStatus();
  let result = {
    chainId: ChainId,
  };
  const zeroContract = await aelf.chain.contractAt(GenesisContractAddress, wallet);
  const list = await Promise.all(
    contractNames.map(async (item) => {
      const { contractName, name, ...left } = item;
      try {
        const address = await zeroContract.GetContractAddressByName.call(
          AElf.utils.sha256(contractName),
        );
        return {
          ...left,
          contractAddress: address,
          contractName: name,
        };
      } catch (e) {
        return {
          ...left,
          contractAddress: '',
          contractName: name,
        };
      }
    }),
  ).then((results) => results.filter((item) => item.contractAddress));
  result = {
    ...result,
    contractAddress: [
      {
        contractName: 'Genesis',
        description: 'contract Genesis',
        contractAddress: GenesisContractAddress,
      },
      ...list,
    ],
  };

  result = {
    ...originResult,
    viewer: {
      ...originResult.viewer,
      ...result,
    },
  };
  fs.writeFileSync(
    path.resolve(__dirname, `../../src/app/network-dao/_src/config/viewer/${fileName}`),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  console.log('writeFileSync', `/config/viewer/${fileName}`);
}

const queryConfig = async () => {
  const fileList = [
    {
      host: 'https://explorer.aelf.io/chain',
      fileName: 'config-mainnet-aelf.json',
    },
    {
      host: 'https://tdvv-explorer.aelf.io/chain',
      fileName: 'config-mainnet-tdvv.json',
    },
    {
      host: 'https://explorer-test.aelf.io/chain',
      fileName: 'config-testnet-aelf.json',
    },
    {
      host: 'https://explorer-test-side02.aelf.io/chain',
      fileName: 'config-testnet-tdvw.json',
    },
  ];
  for (let fileObj of fileList) {
    await getConfig(fileObj.host, fileObj.fileName);
    await getContractAddress(fileObj.host, fileObj.fileName);
  }
};
queryConfig();
