'use client';

import { useUrlPath } from 'hooks/useUrlPath';
import { networkType } from 'config';

export default function VconsoleScript() {
  const { isTelegram } = useUrlPath();
  const isShowVconsole = isTelegram && networkType === 'TESTNET';
  return isShowVconsole ? (
    <>
      <script src="https://unpkg.com/vconsole@3.15.1/dist/vconsole.min.js"></script>
      <script>new window.VConsole();</script>
    </>
  ) : null;
}
