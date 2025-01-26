import { Rule } from 'antd/es/form';

type TValidatorCreate = (
  failCallBack: (v: any) => boolean,
  msg: string,
) => { validator: (rule: any, value: any) => Promise<any> };
export const validatorCreate: TValidatorCreate = (failCallBack, msg: string) => {
  return {
    validator(rule, value) {
      if (failCallBack(value)) {
        return Promise.reject(msg);
      }
      return Promise.resolve();
    },
  };
};

type TPercentageRuleCreate = (min: number, max: number, msg: string) => Rule;

export const createPercentageRule: TPercentageRuleCreate = (min, max, msg) => {
  return {
    required: true,
    type: 'integer',
    min: min,
    max: max,
    message: msg,
  };
};
export const integerRule: Rule = {
  required: true,
  type: 'integer',
  message: 'Please input a integer number',
};
export const percentRule: Rule[] = [
  integerRule,
  validatorCreate((v) => v === 0, 'Please input a number larger than 0'),
  validatorCreate((v) => v > 100, 'Please input a number smaller than 100'),
];
export const min2maxIntegerRule: Rule[] = [
  integerRule,
  {
    validator(rule, value) {
      if (value < 1) {
        return Promise.reject('Please input a number not smaller than 1.');
      }
      return Promise.resolve();
    },
  },
  {
    validator(rule, value) {
      if (value >= Number.MAX_SAFE_INTEGER) {
        return Promise.reject(`Please input a number not larger than ${Number.MAX_SAFE_INTEGER}`);
      }
      return Promise.resolve();
    },
  },
];

export const twitterUsernameRegex = /^@[A-Za-z0-9_]+$/;
export const facebookUrlRegex =
  /^(https:\/\/)?(www\.)?(facebook\.com|discord\.com|t\.me|reddit\.com)\/.*/;
export const urlRegex = /^https:\/\/.+/;

export const mediaValidatorMap = {
  Twitter: {
    validator: [
      validatorCreate(
        (v) => v && !twitterUsernameRegex.test(v),
        'Please enter a correct X handle, starting with @.',
      ),
    ],
  },
  Other: {
    validator: [
      validatorCreate(
        (v) => v && !facebookUrlRegex.test(v),
        'Please enter a correct link. Shortened URLs are not supported.',
      ),
    ],
  },
};
export * from './use-register-form';
