import React, { useEffect } from 'react';
import MyAsset, { IMyAssetProps } from 'pageComponents/assets';
import { completeTaskItem, getTaskList } from 'api/request';
import { curChain } from 'config';
import { UserTask, UserTaskDetail } from '../../type';
export default function Assets(props: IMyAssetProps) {
  useEffect(() => {
    getTaskList({ chainId: curChain }).then((res) => {
      const dailyTasks = res?.data?.taskList?.find((task) => task.userTask === UserTask.Daily);
      const assetTask = dailyTasks?.data?.find(
        (task) => task.userTaskDetail === UserTaskDetail.DailyViewAsset,
      );
      if (!assetTask?.complete) {
        completeTaskItem({
          chainId: curChain,
          userTask: UserTask.Daily,
          userTaskDetail: UserTaskDetail.DailyViewAsset,
        });
      }
    });
  }, []);
  return <MyAsset {...props} />;
}
