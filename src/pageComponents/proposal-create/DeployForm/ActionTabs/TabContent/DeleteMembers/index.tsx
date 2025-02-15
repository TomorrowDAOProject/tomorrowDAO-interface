import { useEffect, useState } from 'react';
import './index.css';
import SelectDeleteItem from './SelectDeleteItem';
import FormMembersItem from 'components/FormMembersItem';
import { formatAddress } from 'utils/address';
import Tooltip from 'components/Tooltip';
import Button from 'components/Button';
import Modal from 'components/Modal';

interface IDeleteMultisigMembersProps {
  form: any;
  removeNamePath: string;
  lists: string[];
  isLoading: boolean;
  errorMessage?: string;
}
function DeleteMultisigMembers(props: IDeleteMultisigMembersProps) {
  const { form, removeNamePath, lists, isLoading, errorMessage } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSelectList, setModalSelectList] = useState<string[]>([]);
  const { watch, setValue, trigger } = form;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selectList = watch(removeNamePath) ?? [];

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const syncList2Form = (list: string[]) => {
    setValue(
      removeNamePath,
      list.map((item) => formatAddress(item)),
    );
    trigger(removeNamePath);
  };
  useEffect(() => {
    const revertList = selectList?.map((item: string) => {
      if (item.includes('_')) {
        return item.slice(4, -5);
      }
      return item;
    });
    setModalSelectList(revertList || []);
  }, [selectList]);

  return (
    <div className="delete-multisig-members-wrap">
      <FormMembersItem
        name={removeNamePath}
        initialValue={[]}
        form={form}
        errorMessage={errorMessage}
        hiddenExtraWhenEmpty={true}
        disableInput={true}
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
              <i className="tmrwdao-icon-information text-[18px] text-lightGrey" />
            </span>
          </Tooltip>
        }
        emptyNode={
          <div className="flex flex-col gap-5 items-center py-[64px]">
            <span className="font-Montserrat text-desc12 text-lightGrey">
              Choose a address to remove
            </span>
            <Button
              type="default"
              className="border-white text-white"
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
              className="!py-1 !text-[12px]"
              type="default"
              onClick={() => setIsModalOpen(true)}
            >
              <i className="tmrwdao-icon-circle-add text-[22px] mr-[6px]" />
              Select addresses
            </Button>
            <Button
              type="default"
              onClick={() => {
                setValue(removeNamePath, []);
              }}
              className="!py-1 !text-[12px]"
            >
              <i className="tmrwdao-icon-delete text-[22px] mr-[6px]" />
              Delete all
            </Button>
          </>
        }
      />
      <Modal isVisible={isModalOpen} onClose={handleCancel} rootClassName="md:w-[471px]">
        <div className="px-[38px] py-[30px]">
          {!isLoading && (
            <>
              <SelectDeleteItem
                lists={lists}
                value={modalSelectList}
                onChange={(list: string[]) => {
                  setModalSelectList(list);
                }}
              />
              <div className="flex gap-[16px]">
                <Button className="flex-1 border-white text-white" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  type="primary"
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
      </Modal>
    </div>
  );
}

export default DeleteMultisigMembers;
