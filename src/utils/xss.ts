import xss from 'xss';
export const xssFilter = (source: string) => {
  return xss(source, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script'],
  });
};
