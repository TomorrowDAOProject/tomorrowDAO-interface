import { explorer } from 'config';

export const sleep = (time: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

export function getExploreLink(
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block',
): string {
  switch (type) {
    case 'transaction': {
      return `${explorer}/tx/${data}`;
    }
    case 'token': {
      return `${explorer}/token/${data}`;
    }
    case 'block': {
      return `${explorer}/block/${data}`;
    }
    case 'address':
    default: {
      return `${explorer}/address/${data}`;
    }
  }
}
