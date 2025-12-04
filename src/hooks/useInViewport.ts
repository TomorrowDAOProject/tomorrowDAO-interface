import React, { useEffect, useMemo, useState } from 'react';

const useInViewport = <T extends HTMLElement>(
  ref: React.RefObject<T>,
  onFirstView?: () => void,
  onEnter?: () => void,
  onExit?: () => void,
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [visited, setVisited] = useState(false);

  const observer = useMemo(() => {
    return new IntersectionObserver(([entry]) => {
      return setIsVisible(entry.isIntersecting);
    });
  }, []);

  useEffect(() => {
    if (ref?.current) {
      // dont change ref after you initialize the useInViewport
      observer?.observe(ref.current);
    }
    return () => {
      observer?.disconnect();
    };
  }, [ref, observer]);

  useEffect(() => {
    if (isVisible && !visited) {
      onFirstView && onFirstView();
      setVisited(true);
    }
    if (visited) {
      if (isVisible) {
        onEnter && onEnter();
      } else {
        onExit && onExit();
      }
    }
  }, [isVisible, visited]);

  return isVisible;
};

export default useInViewport;
