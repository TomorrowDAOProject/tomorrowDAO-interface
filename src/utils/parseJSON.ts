export const parseJSON = (str: string) => {
  let result = null;
  try {
    result = JSON.parse(str);
  } catch (e) {
    result = str;
  }
  return result;
};

export function uint8ToBase64(u8Arr: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>) {
  return Buffer.from(u8Arr).toString('base64');
}

export function filterInvalidFields(obj: Record<string, string>): Record<string, string> {
  return Object.entries(obj).reduce((acc: Record<string, string>, [key, value]) => {
    if (key !== '' && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});
}
