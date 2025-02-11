export const stringToFile = ({
  text,
  type = 'text/plain',
  name = 'markdown.txt',
}: {
  text: string;
  type: string;
  name: string;
}) => {
  return new File([text], name, { type });
};

export const fileToString = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = (event.target?.result as string | undefined) || '';
      resolve(result);
    };
    reader.onerror = (event) => {
      reject(event.target?.error);
    };
    reader.readAsText(file);
  });
};

export const preloadImages = (imageUrls: string[]) => {
  imageUrls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
};

export const shortenFileName = (str: string, maxLength = 20) => {
  if (str.length <= maxLength) {
    return str;
  }

  const frontChars = str.slice(0, 8);
  const backChars = str.slice(-8);

  return `${frontChars}...${backChars}`;
};

export function generateRandomString(len = 10) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function blobToFile(blob: Blob, fileName?: string) {
  const fileNameWithExtension = fileName || generateRandomString(10) + '.png';
  const file = new File([blob], fileNameWithExtension, {
    type: blob.type,
    lastModified: Date.now(),
  });
  return file;
}
