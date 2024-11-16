import React, { useEffect, useRef, useState } from 'react';
// import { flatten } from 'lodash-es';
import './index.css';
import { useRequest, usePrevious, useAsyncEffect } from 'ahooks';
import { getTaskList } from 'api/request';
import { curChain } from 'config';
import Loading from '../../components/Loading';
import { taskTitle } from '../../const';
import { IStackItem, UserTaskDetail } from '../../type';
import { TaskItem } from './TaskItem';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
// import CommonModal, { ICommonModalRef } from '../../components/CommonModal';
// import { Button } from 'antd';

interface ITaskProps {
  style?: React.CSSProperties;
  className?: string;
  show: boolean;
  activeTabItem: (item: IStackItem) => void;
}
const Task: React.FC<ITaskProps> = (props: ITaskProps) => {
  const { style, className, show, activeTabItem } = props;
  const { walletInfo: wallet } = useConnectWallet();
  // const completeTaskModalRef = useRef<ICommonModalRef>(null);
  const [taskGroupList, setTaskGroupList] = useState<IGetTaskListResItem[]>([]);
  const {
    data,
    error: taskListError,
    loading: taskListLoading,
    run: getTaskListFn,
    runAsync: getTaskListAsync,
  } = useRequest(
    async () => {
      const res = await getTaskList({ chainId: curChain });
      setTaskGroupList(res?.data?.taskList || []);
      return res;
    },
    {
      manual: true,
    },
  );
  const handleReportComplete = (task: string, taskDetail: string) => {
    const taskGroupListCopy = taskGroupList.slice(0);
    const targetGroup = taskGroupListCopy.find((group) => group.userTask === task);
    if (targetGroup) {
      const targetItem = targetGroup.data.find((item) => item.userTaskDetail === taskDetail);
      if (targetItem) {
        targetItem.complete = true;
      }
    }
    setTaskGroupList(taskGroupListCopy);
  };
  useAsyncEffect(async () => {
    if (!show) return;
    const listRes = await getTaskListAsync();
    console.log(listRes?.data?.taskList);
    setTaskGroupList(listRes?.data?.taskList || []);
  }, [show]);
  // useEffect(() => {
  //   const listsGroup = taskGroupList?.map((group) => group.data);
  //   const lists = flatten(listsGroup);
  //   const completed = [
  //     UserTaskDetail.DailyVote,
  //     UserTaskDetail.ExploreFollowX,
  //     UserTaskDetail.ExploreJoinDiscord,
  //     UserTaskDetail.ExploreJoinTgChannel,
  //   ].every((item) => {
  //     const task = lists.find((list) => list.userTaskDetail === item);
  //     return task?.complete;
  //   });
  //   const key = `${wallet?.address}-${curChain}-task-complate`;
  //   if (completed && !localStorage.getItem(key)) {
  //     localStorage.setItem(key, 'true');
  //     completeTaskModalRef.current?.open();
  //   }
  // }, [taskGroupList, wallet?.address]);
  return (
    <div className={`votigram-task-wrap ${className}`} style={style}>
      <div className="title font-18-22-weight mt-[24px] mb-[8px]">
        <img src="/images/tg/celebratory-fireworks-icon.png" alt="" />
        <span>Complete tasks to earn more points!</span>
      </div>
      <div className="flex-center">
        <img src="/images/tg/complete-task.png" alt="" className="task-complete-icon" />
      </div>
      {taskListLoading ? (
        <div className="votigram-loading-wrap">
          <Loading />
        </div>
      ) : (
        <div>
          {taskGroupList?.map((taskGroup, index) => {
            return (
              <div className="task-group-item" key={'group' + index}>
                <h2 className="font-18-22-weight text-white flex items-center">
                  <img
                    src={taskTitle[taskGroup.userTask].icon}
                    alt=""
                    width={16}
                    className="mr-[4px]"
                  />
                  {taskTitle[taskGroup.userTask].title}
                </h2>
                {taskGroup?.data?.map((taskItem, i) => {
                  return (
                    <TaskItem
                      key={'item' + i}
                      taskItem={taskItem}
                      activeTabItem={activeTabItem}
                      userTask={taskGroup.userTask}
                      getTaskListFn={getTaskListFn}
                      onReportComplete={handleReportComplete}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
      {/* <CommonModal
        ref={completeTaskModalRef}
        title="Congratulations!"
        content={
          <div className="complete-task-modal-content">
            <img
              src={'/images/tg/celebratory-fireworks-icon.png'}
              alt=""
              width={96}
              height={96}
              className="rounded-[16px] mt-[24px]"
            />
            <p className="my-[24px]">
              You have completed the designated tasks and are included in the coming raffle after
              the voting period ends!
            </p>
            <div className="mt-[16px] w-full">
              <Button
                onClick={() => {
                  completeTaskModalRef.current?.close();
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        }
      /> */}
    </div>
  );
};

export default Task;
