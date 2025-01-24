import { HashAddress, Tooltip } from 'aelf-design';
import Link from 'next/link';
import { curChain, explorer, treasuryContractAddress } from 'config';
import { SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteScroll, useRequest } from 'ahooks';
import {
  addCommentReq,
  fetchDaoExistMembers,
  fetchDaoInfo,
  getCommentLists,
  isDepositor,
} from 'api/request';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { callViewContract } from 'contract/callContract';
import { unionBy } from 'lodash-es';
import './index.css';
import { EDaoGovernanceMechanism } from 'app/(createADao)/create/type';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

import { useEffectOnce } from 'react-use';
import clsx from 'clsx';
import { xssFilter } from 'utils/xss';
import useResponsive from 'hooks/useResponsive';
import LoadMoreButton from 'components/LoadMoreButton';
import Image from 'next/image';
import Button from 'components/Button';
import { ReactComponent as LinkIcon } from 'assets/revamp-icon/link.svg';
import Input from 'components/Input';

dayjs.extend(relativeTime);
interface IDiscussionProps {
  proposalId: string;
  daoId: string;
}
const maxLen = 10000;
const getShortTimeDesc = (time: number) => {
  return dayjs().to(dayjs(time));
};
// const Avatar = () => {
//   return (
//     <svg
//       className="user-avatar"
//       width="28"
//       height="28"
//       viewBox="0 0 28 28"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <circle cx="14" cy="14" r="14" fill="#EDEDED" />
//       <path
//         fillRule="evenodd"
//         clipRule="evenodd"
//         d="M13.9999 15C16.7613 15 19 12.7618 19 10C19 7.23919 16.7613 5 13.9999 5C11.2385 5 9 7.23919 9 10C9 12.7618 11.2385 15 13.9999 15ZM13.9998 28C19.1727 28 23.6903 25.1945 26.1141 21.022C18.6199 16.977 9.39388 16.9927 1.91309 21.0692C4.34344 25.2156 8.84648 28 13.9998 28Z"
//         fill="#B8B8B8"
//       />
//     </svg>
//   );
// };
interface IFetchResult {
  list: ICommentListsItem[];
  hasData: boolean;
}
enum EPosition {
  head = 'head',
  tail = 'tail',
}
type AddToRenderQueueFn = (lists: ICommentListsItem[], position: EPosition) => void;
const MultisigDAOTip = 'Only DAO members can submit comments';
const CommentContent = ({ comment }: { comment: string }) => {
  const filtedContent = useMemo(() => xssFilter(comment), [comment]);
  return (
    <pre
      className="body text-white text-[15px]"
      dangerouslySetInnerHTML={{
        __html: filtedContent,
      }}
    ></pre>
  );
};
export default function Discussion(props: IDiscussionProps) {
  const { walletInfo: wallet } = useConnectWallet();
  const { proposalId, daoId } = props;
  const [content, setContent] = useState('');
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const [renderCommentLists, setRenderCommentLists] = useState<ICommentListsItem[]>([]);
  const { isLG } = useResponsive();

  const addToRenderQueueRef = useRef<AddToRenderQueueFn>();
  const handleChange = (value: string) => {
    if (value.length > maxLen) {
      setErrorMessage('Supports a maximum input of 10,000 characters.');
    } else {
      setErrorMessage('');
    }
    setContent(value);
  };
  const fetchCommentListsAPI: (data?: IFetchResult) => Promise<IFetchResult> = async (data) => {
    const preList = renderCommentLists;
    const lastComment = preList[preList.length - 1];
    const reqParams: ICommentListsReq = {
      maxResultCount: 10,
      chainId: curChain,
      proposalId: proposalId,
    };
    if (lastComment) {
      reqParams.skipId = lastComment.id;
    }
    const res = await getCommentLists(reqParams);
    if (res.data.totalCount) {
      setTotal(res.data.totalCount);
    }
    return {
      list: res.data.items,
      hasData: res.data.hasMore,
    };
  };
  const {
    data: commentListsData,
    loading,
    loadMore,
    loadingMore,
  } = useInfiniteScroll(fetchCommentListsAPI, {
    manual: true,
  });
  const { data: canSendCheckRes, run: checkSendStatus } = useRequest(
    async () => {
      const daoInfo = await fetchDaoInfo({ daoId, chainId: curChain });
      if (daoInfo.data.governanceMechanism === EDaoGovernanceMechanism.Multisig) {
        if (!wallet?.address) {
          return {
            isEnable: false,
            message: MultisigDAOTip,
          };
        }
        const dataRes = await fetchDaoExistMembers({
          chainId: curChain,
          daoId: daoId,
          memberAddress: wallet.address,
        });
        return {
          isEnable: dataRes?.data,
          message: dataRes?.data ? '' : MultisigDAOTip,
        };
      }
      if (daoInfo.data.governanceMechanism === EDaoGovernanceMechanism.Token) {
        const token = daoInfo.data.governanceToken;
        const tip = `You need to have deposited some ${token}s to submit your comment`;
        const treasuryAddress = await callViewContract<string, string>(
          'GetTreasuryAccountAddress',
          daoId,
          treasuryContractAddress,
        );
        if (!wallet?.address || !treasuryAddress) {
          return {
            isEnable: false,
            message: tip,
          };
        }
        const isDepositorRes = await isDepositor({
          chainId: curChain,
          treasuryAddress: treasuryAddress,
          address: wallet.address,
          governanceToken: token,
        });
        return {
          isEnable: isDepositorRes?.data,
          message: isDepositorRes?.data ? '' : tip,
        };
      }
      return {
        isEnable: false,
        message: 'unknown governance mechanism',
      };
    },
    { manual: true },
  );

  const addToRenderQueue: AddToRenderQueueFn = (lists, position) => {
    if (position === EPosition.head) {
      setRenderCommentLists(unionBy([...lists, ...renderCommentLists], 'id'));
    }
    if (position === EPosition.tail) {
      setRenderCommentLists(unionBy([...renderCommentLists, ...lists], 'id'));
    }
  };
  addToRenderQueueRef.current = addToRenderQueue;

  useEffect(() => {
    // add to queue tail
    if (commentListsData?.list) {
      addToRenderQueueRef.current?.(commentListsData.list, EPosition.tail);
    }
  }, [commentListsData]);

  const updateCommentAndApi = async (content: string, parentId?: string) => {
    // add to db
    const latestCommentRes = await addCommentReq({
      chainId: curChain,
      proposalId: proposalId,
      comment: content,
      parentId: parentId,
    });
    const reqParams: ICommentListsReq = {
      maxResultCount: 1,
      chainId: curChain,
      proposalId: proposalId,
    };
    const res = await getCommentLists(reqParams);
    if (res.data.totalCount) {
      setTotal(res.data.totalCount);
    }
    const latestComment = latestCommentRes?.data?.comment;
    if (latestComment) {
      addToRenderQueueRef.current?.([latestComment], EPosition.head);
    }
  };
  const { run: addComment, loading: addCommentLoading } = useRequest(updateCommentAndApi, {
    manual: true,
  });
  useEffectOnce(() => {
    loadMore();
  });

  const sendButtonStatus = useMemo(() => {
    if (content.trim().length === 0) {
      return {
        isEnable: false,
        message: 'Please enter your comment',
      };
    }
    return canSendCheckRes;
  }, [content, canSendCheckRes]);
  const disabled = !sendButtonStatus?.isEnable || errorMessage;
  const handleSendComment = () => {
    if (disabled) {
      return;
    }
    const filteredContent = xssFilter(content);
    addComment(filteredContent);
    setContent('');
  };
  useEffect(() => {
    checkSendStatus();
  }, [wallet?.address, checkSendStatus]);
  return (
    <div className="border border-fillBg8 border-solid rounded-lg bg-darkBg px-[24px] py-[25px]">
      <div className="text-[18px] font-medium font-Montserrat text-white mb-[20px]">
        Discussion
        {total > 0 && <span> ({total})</span>}
      </div>
      <div className="input-wrap flex items-center justify-between gap-[20px]">
        <Input
          placeholder="Thoughts?..."
          className="input-box"
          onChange={handleChange}
          // status={errorMessage ? 'error' : ''}
          value={content}
        />
        <Tooltip
          className="send-tool-tip shrink-0"
          title={sendButtonStatus?.message}
          trigger={isLG ? 'click' : 'hover'}
          overlayClassName="send-tool-tip"
        >
          <div>
            <Button
              type="primary"
              onClick={handleSendComment}
              className={clsx('send-button flex gap-[10px]', {
                disabled: disabled,
              })}
              loading={addCommentLoading}
            >
              <span>Send it</span>
              <LinkIcon className="h-[11px] w-[11px]" />
            </Button>
          </div>
        </Tooltip>
      </div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <ul className="message-lists">
        {renderCommentLists.map((commentItem) => {
          console.log('commentItem', commentItem);
          return (
            <li className="message-lists-item" key={commentItem.id} data-id={commentItem.id}>
              <div className="user flex items-center gap-4 mt-8 mb-[16px]">
                {commentItem?.commenterPhoto ? (
                  <Image src={commentItem?.commenterPhoto || ''} width={33} height={33} alt="" />
                ) : (
                  <div className="w-[33px] h-[33px] rounded-full bg-white"></div>
                )}

                <div className="user-info">
                  <Link href={`${explorer}/address/${commentItem.commenter}`}>
                    <HashAddress
                      preLen={8}
                      endLen={11}
                      className="user-info-address text-white text-[13px]"
                      address={commentItem.commenter}
                      chain={curChain}
                    />
                  </Link>
                  <p className="user-info-time text-lightGrey text-[12px]">
                    {getShortTimeDesc(commentItem.createTime)}
                  </p>
                </div>
              </div>
              <CommentContent comment={commentItem.comment} />
            </li>
          );
        })}
      </ul>
      {commentListsData?.hasData && (
        <div className="loading-more-wrap">
          <LoadMoreButton onClick={loadMore} loadingMore={loadingMore} />
        </div>
      )}
    </div>
  );
}
