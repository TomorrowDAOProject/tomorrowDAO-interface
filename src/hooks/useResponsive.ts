import { useMemo } from 'react';
import { useWindowSize } from 'react-use';

export default function useResponsive() {
  const { width } = useWindowSize();

  const isSM = useMemo(() => {
    return width <= 640;
  }, [width]);
  const isMD = useMemo(() => {
    return width <= 768;
  }, [width]);
  const isLG = useMemo(() => {
    return width <= 1024;
  }, [width]);
  const isXL = useMemo(() => {
    return width <= 1280;
  }, [width]);
  const is2XL = useMemo(() => {
    return width <= 1440;
  }, [width]);

  return {
    isMD,
    isSM,
    isLG,
    isXL,
    is2XL,
  };
}

export function useLandingPageResponsive() {
  const { width } = useWindowSize();

  const isPad = width < 992;
  const isPhone = width < 768;

  return {
    isPad,
    isPhone,
  };
}
