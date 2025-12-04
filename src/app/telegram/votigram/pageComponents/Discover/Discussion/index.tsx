import { HashAddress } from 'aelf-design';
import { Input, Button } from 'antd';
import { curChain } from 'config';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteScroll, useRequest } from 'ahooks';
import { addCommentReq, getCommentLists } from 'api/request';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { unionBy } from 'lodash-es';
import { useEffectOnce } from 'react-use';
import useInputForceRender from '../../../hook/use-input-force-render';
import clsx from 'clsx';
import LoadMoreButton from '../../../components/LoadMoreButton';
import './index.css';
import { SendIcon } from 'components/Icons';
import { xssFilter } from 'utils/xss';

const { TextArea } = Input;
dayjs.extend(relativeTime);
interface IDiscussionProps {
  alias: string;
  onTotalChange?: (total: number) => void;
  total?: number;
}
const maxLen = 10000;
const getShortTimeDesc = (time: number) => {
  return dayjs().to(dayjs(time));
};

interface IFetchResult {
  list: ICommentListsItem[];
  hasData: boolean;
}
enum EPosition {
  head = 'head',
  tail = 'tail',
}
type AddToRenderQueueFn = (lists: ICommentListsItem[], position: EPosition) => void;
const CommentContent = ({ comment }: { comment: string }) => {
  const filtedContent = useMemo(() => xssFilter(comment), [comment]);
  return (
    <pre
      className="discover-app-detail-body font-14-20 text-wrap break-words"
      dangerouslySetInnerHTML={{
        __html: filtedContent,
      }}
    ></pre>
  );
};
export default function Discussion(props: IDiscussionProps) {
  const { alias, total } = props;
  const [content, setContent] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const inputWrapRef = useRef<HTMLDivElement>(null);

  const updatetotal = (total: number) => {
    props.onTotalChange?.(total);
  };

  const [renderCommentLists, setRenderCommentLists] = useState<ICommentListsItem[]>([]);

  const addToRenderQueueRef = useRef<AddToRenderQueueFn>();
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length > maxLen) {
      setErrorMessage('Supports a maximum input of 10,000 characters.');
    } else {
      setErrorMessage('');
    }
    setContent(e.target.value);
  };
  const fetchCommentListsAPI: (data?: IFetchResult) => Promise<IFetchResult> = async (data) => {
    const preList = renderCommentLists;
    const lastComment = preList[preList.length - 1];
    const reqParams: ICommentListsReq = {
      maxResultCount: 10,
      chainId: curChain,
      alias: alias,
    };
    if (lastComment) {
      reqParams.skipId = lastComment.id;
    }
    const res = await getCommentLists(reqParams);
    if (res.data.totalCount) {
      updatetotal(res.data.totalCount);
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
      alias: alias,
      comment: content,
      parentId: parentId,
    });
    const reqParams: ICommentListsReq = {
      maxResultCount: 1,
      chainId: curChain,
      alias: alias,
    };
    const latestComment = latestCommentRes?.data?.comment;
    if (latestComment) {
      addToRenderQueueRef.current?.([latestComment], EPosition.head);
    }
    setTimeout(async () => {
      const res = await getCommentLists(reqParams);
      if (res.data.totalCount) {
        updatetotal(res.data.totalCount);
      }
    }, 1000);
  };
  const { run: addComment, loading: addCommentLoading } = useRequest(updateCommentAndApi, {
    manual: true,
  });
  useEffectOnce(() => {
    loadMore();
  });

  const disabled = errorMessage || !content.trim().length;
  const handleSendComment = () => {
    if (disabled) {
      return;
    }
    const filtedContent = xssFilter(content);
    addComment(filtedContent);
    setContent('');
  };
  useInputForceRender(inputWrapRef);
  return (
    <div className="discover-app-detail-discussion-wrap">
      <h3 className="font-20-28-weight text-white" id="discussion">
        Discussion <span className="font-14-20">({total})</span>
      </h3>
      <div className="discover-app-detail-input-wrap" ref={inputWrapRef}>
        <TextArea
          placeholder="Thoughts?..."
          className="discover-app-detail-input-box"
          onChange={handleChange}
          status={errorMessage ? 'error' : ''}
          value={content}
          autoSize={{ minRows: 1, maxRows: 10 }}
        />
        <div>
          <Button
            type="primary"
            onClick={handleSendComment}
            className={clsx('discover-app-detail-send-button', {
              disabled: disabled,
            })}
            loading={addCommentLoading}
          >
            <SendIcon />
          </Button>
        </div>
      </div>
      {errorMessage && (
        <div className="discover-app-detail-error-message font-14-20">{errorMessage}</div>
      )}
      <ul
        className={`${
          commentListsData?.hasData ? 'with-loadmore' : 'without-loadmore'
        } discover-app-detail-message-lists`}
      >
        {renderCommentLists.map((commentItem) => {
          return (
            <li
              className="discover-app-detail-message-lists-item"
              key={commentItem.id}
              data-id={commentItem.id}
            >
              <div className="discover-app-detail-user">
                <div className="discover-app-detail-user-info">
                  {/* <Link href={`${explorer}/address/${commentItem.commenter}`}> */}
                  <HashAddress
                    preLen={8}
                    endLen={9}
                    className="discover-app-detail-user-info-address"
                    address={commentItem.commenter}
                    chain={curChain}
                    ignoreEvent
                    hasCopy={false}
                  />
                  {/* </Link> */}
                  <p className="discover-app-detail-user-info-time font-12-16">
                    {getShortTimeDesc(commentItem.createTime)}
                  </p>
                </div>
              </div>
              <CommentContent comment={commentItem.comment} />
            </li>
          );
        })}
      </ul>
      {renderCommentLists.length === 0 && (
        <div className="mt-[64px] mb-[76px] font-14-18 text-center">Waiting for you</div>
      )}
      {commentListsData?.hasData && <LoadMoreButton onClick={loadMore} loading={loadingMore} />}
    </div>
  );
}
