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

export const shortenFileName = (filename: string, maxLength = 20) => {
  const regex = /(.+)(\.[^.]+)$/;

  const match = filename.match(regex);
  if (!match) return filename;

  const name = match[1];
  const extension = match[2];

  if (name.length > maxLength) {
    const keep = Math.floor((maxLength - 3) / 2);
    const start = name.slice(0, keep);
    const end = name.slice(-keep);
    return `${start}...${end}${extension}`;
  }

  return filename;
};
