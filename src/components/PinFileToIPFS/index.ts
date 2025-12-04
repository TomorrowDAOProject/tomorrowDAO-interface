const JWT = `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`;

async function pinFileToIPFS(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const pinataMetadata = JSON.stringify({
    name: file.name,
    //   keyvalues: {
    //     description: 'File description',
    //     externalUrl: 'xxx',
    //   },
  });
  formData.append('pinataMetadata', pinataMetadata);

  const options = {
    method: 'POST',
    headers: {
      // 'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
      authorization: JWT,
    },
    body: formData,
  } as RequestInit;

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', options);
  const resData = await res.json();

  return {
    cid: resData.IpfsHash ?? '',
    name: file.name ?? '',
    url: `https://silver-abstract-unicorn-590.mypinata.cloud/ipfs/${resData.IpfsHash}?pinataGatewayToken=${process.env.NEXT_PUBLIC_GATEWAY_TOKEN}`,
  };
}

export default pinFileToIPFS;
