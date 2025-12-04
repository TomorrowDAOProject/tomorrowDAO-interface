import { Button, Modal, Space } from 'antd';
import { useCallback, useMemo, useRef } from 'react';

export default function useLoading() {
  const showLoading = () => {
    Modal.info({
      title: 'loading',
      content: <div>loading</div>,
      onOk() {
        console.log('OK');
      },
    });
  };

  const closeLoading = useCallback(() => {
    Modal.destroyAll();
  }, []);

  return useMemo(
    () => ({
      showLoading,
      closeLoading,
    }),
    [closeLoading, showLoading],
  );
}
