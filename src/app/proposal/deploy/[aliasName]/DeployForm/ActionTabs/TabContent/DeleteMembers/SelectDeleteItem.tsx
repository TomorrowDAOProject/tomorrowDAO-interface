import { HashAddress } from 'aelf-design';
import { Checkbox, CheckboxProps } from 'antd';
import { curChain } from 'config';
import { formatAddress } from 'utils/address';
interface IFormDeleteItemProps {
  value?: string[];
  onChange?: (v: string[]) => void;
  lists: string[];
}
const CheckboxGroup = Checkbox.Group;
function FormDeleteItem(props: IFormDeleteItemProps) {
  const { value = [], onChange, lists } = props;
  const checkAll = value.length === lists.length;
  const indeterminate = value.length > 0 && value.length < lists.length;

  const handleChange = (list: string[]) => {
    onChange?.(list);
  };

  const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
    onChange?.(e.target.checked ? lists : []);
  };
  return (
    <>
      <div className="flex justify-between items-center">
        <p className="form-item-title text-Neutral-Secondary-Text">
          {value.length} address selected
        </p>
        <div>
          <span className="form-item-title pr-[16px]">Select All</span>
          <Checkbox
            indeterminate={indeterminate}
            onChange={onCheckAllChange}
            checked={checkAll}
            className="delete-multisig-members-check"
          />
        </div>
      </div>
      <CheckboxGroup onChange={handleChange} value={value} className="w-full">
        <ul className="delete-multisig-members-list w-full">
          {lists?.map((item) => {
            return (
              <li key={item} className="delete-multisig-members-item w-full">
                <HashAddress
                  hasCopy={false}
                  className="normal-text"
                  preLen={8}
                  endLen={11}
                  address={item}
                  chain={curChain}
                ></HashAddress>
                <Checkbox value={item} className="delete-multisig-members-check"></Checkbox>
              </li>
            );
          })}
        </ul>
      </CheckboxGroup>
    </>
  );
}

export default FormDeleteItem;
