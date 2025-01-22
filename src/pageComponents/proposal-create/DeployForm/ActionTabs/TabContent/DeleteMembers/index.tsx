import { Button } from 'aelf-design';
import CommonModal from 'components/CommonModal';
import { ReactComponent as QuestionIcon } from 'assets/imgs/question-icon.svg';
import { SkeletonLine } from 'components/Skeleton';
import { useEffect, useState } from 'react';
import './index.css';
import SelectDeleteItem from './SelectDeleteItem';
import { Form, FormInstance, Tooltip } from 'antd';
import FormMembersItem from 'components/FormMembersItem';
import { AddCircleOutlined, DeleteOutlined } from '@aelf-design/icons';
import { formatAddress } from 'utils/address';

interface IDeleteMultisigMembersProps {
  form: FormInstance;
  lists: string[];
  removeNamePath: string[];
  isLoading: boolean;
  overLimitErrorText: string;
}
function DeleteMultisigMembers(props: IDeleteMultisigMembersProps) {
  const { form, removeNamePath, lists, isLoading, overLimitErrorText } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSelectList, setModalSelectList] = useState<string[]>([]);
  const selectList = Form.useWatch(removeNamePath, form) ?? [];
  // console.log('selectList', selectList);
  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const syncList2Form = (list: string[]) => {
    form.setFieldValue(
      removeNamePath,
      list.map((item) => formatAddress(item)),
    );
    form.validateFields([removeNamePath]);
  };
  useEffect(() => {
    const revertList = selectList.map((item: string) => {
      if (item.includes('_')) {
        return item.slice(4, -5);
      }
      return item;
    });
    setModalSelectList(revertList);
  }, [selectList.length]);

  return (
    <div className="delete-multisig-members-wrap">
      <FormMembersItem
        name={removeNamePath}
        initialValue={[]}
        form={form}
        hiddenExtraWhenEmpty={true}
        disableInput={true}
        rules={[
          {
            validator: async (_, deleteLists) => {
              if (deleteLists.length >= lists.length) {
                return Promise.reject(new Error(overLimitErrorText));
              }
            },
          },
        ]}
        titleNode={
          <Tooltip
            title={
              <div className="text-[10px] leading-[12px]">
                There is no limit on the number of addresses on your multisig. Addresses can create
                proposals, create and approve transactions, and suggest changes to the DAO settings
                after creation.
              </div>
            }
          >
            <span className="flex items-center text-descM15 text-white font-Montserrat gap-[8px]">
              Delete Multisig Members Address
              <i className="tmrwdao-icon-information text-[18px] text-white" />
            </span>
          </Tooltip>
        }
        emptyNode={
          <div className="flex flex-col gap-[16px] items-center py-[64px]">
            <p className="">Choose a address to remove</p>
            <Button
              type="primary"
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              Select addresses
            </Button>
          </div>
        }
        footNode={
          <>
            <Button
              className="dynamic-form-buttons-item !w-auto"
              type="default"
              onClick={() => setIsModalOpen(true)}
              icon={
                <span className="text-[14px] ">
                  <AddCircleOutlined />
                </span>
              }
            >
              Select addresses
            </Button>
            <Button
              type="default"
              onClick={() => {
                form.setFieldValue(removeNamePath, []);
              }}
              className="dynamic-form-buttons-item"
              icon={
                <span className="text-[14px]">
                  <DeleteOutlined />
                </span>
              }
            >
              Delete all
            </Button>
          </>
        }
      />
      <CommonModal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        closable={false}
        isShowHeader={false}
      >
        <div className="delete-multisig-members-body mt-[24px]">
          {isLoading ? (
            <SkeletonLine />
          ) : (
            <>
              <SelectDeleteItem
                lists={lists}
                value={modalSelectList}
                onChange={(list: string[]) => {
                  setModalSelectList(list);
                  // form.setFieldValue(removeNamePath, list);
                }}
              />
              <div className="delete-multisig-members-buttons">
                <Button className="delete-multisig-members-buttons-item" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  className="delete-multisig-members-buttons-item"
                  onClick={() => {
                    syncList2Form(modalSelectList);
                    setIsModalOpen(false);
                  }}
                >
                  Select addresses
                </Button>
              </div>
            </>
          )}
        </div>
      </CommonModal>
    </div>
  );
}

export default DeleteMultisigMembers;
