import { useEffect } from 'react';
export default function useInputForceRender(wrapperRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    // Force the browser to refresh the position
    // The actual position and the position displayed by the browser are inconsistent, forcing a refresh
    const forceRefreshDomPosition = () => {
      window?.scrollTo(window.scrollX, window.scrollY - 1);
    };
    const timers: NodeJS.Timeout[] = [];
    // Avoid the keyboard covering the input box
    const scroll = (event: Event) => {
      const timeout = setTimeout(() => {
        const htmlTargetElement = event.currentTarget as HTMLElement;
        htmlTargetElement?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
      timers.push(timeout);
    };
    const inputElement = wrapperRef.current?.querySelectorAll('input[type="text"]') ?? [];
    const textareaElement = wrapperRef.current?.querySelectorAll('textarea') ?? [];
    const elements = [...Array.from(inputElement), ...Array.from(textareaElement)];
    for (const element of elements) {
      element.addEventListener('blur', forceRefreshDomPosition);
      element.addEventListener('focus', scroll);
    }
    window?.Telegram?.WebApp?.onEvent('viewportChanged', forceRefreshDomPosition);
    return () => {
      for (const element of elements) {
        element.removeEventListener('blur', forceRefreshDomPosition);
        element.removeEventListener('focus', scroll);
      }
      window?.Telegram?.WebApp?.offEvent('viewportChanged', forceRefreshDomPosition);
      for (const timeout of timers) {
        clearTimeout(timeout);
      }
    };
  }, []);
}
