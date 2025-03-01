/**
 * @file stateMachine
 * @author zhouminghui
 */

import { toast } from 'react-toastify';


export default function getStateJudgment(status, hash) {
  switch ((status || '').toUpperCase()) {
    case 'NOTEXISTED':
      toast.error(
        'The transaction is no existed. Please make sure you have enough balance or query the transaction ID',
        10,
      );
      toast.error(`Transaction ID: ${hash}`, 10);
      break;
    case 'PENDING':
      toast.info(
        'The transaction is in progress. Please query the transaction ID',
        {
          icon: <i className="tmrwdao-icon-information text-[16px] text-white" />,
        }
      );
      toast.info(`Transaction ID: ${hash}`, {
        icon: <i className="tmrwdao-icon-information text-[16px] text-white" />,
      });
      break;
    case 'MINED':
      toast.success('Successful operation', 3);
      toast.success(`Transaction ID: ${hash}`, 6);
      break;
    case 'FAILED':
      toast.error('Operation failed', 3);
      break;
    case 'UNEXECUTABLE':
      toast.error('Unexecutable Operation', 3);
      break;
  }
}
