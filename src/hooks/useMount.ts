import { useState, useEffect } from 'react';

export default function useMount() {
  const [isMount, setMount] = useState(false);
  useEffect(() => {
    setMount(true);
  }, []);
  return isMount;
}
