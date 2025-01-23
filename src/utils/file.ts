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

  const frontChars = str.slice(0, 5);
  const backChars = str.slice(-5);

  return `${frontChars}...${backChars}`;
};
