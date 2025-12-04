import { usePathname } from 'next/navigation';

export function useUrlPath() {
  const pathName = usePathname();
  const isHome = pathName === '/';
  const isExplorer = pathName === '/explore';
  const isTelegram = pathName.startsWith('/telegram');
  return {
    isHome,
    isExplorer,
    isTelegram,
  };
}
