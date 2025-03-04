import clsx from 'clsx';
import Checkbox from 'components/Checkbox';
import { curChain } from 'config';
import { shortenFileName } from 'utils/file';
interface IFormDeleteItemProps {
  value?: string[];
  onChange?: (v: string[]) => void;
  lists: string[];
}
function FormDeleteItem(props: IFormDeleteItemProps) {
  const { value = [], onChange, lists } = props;
  const checkAll = value.length === lists.length;

  const handleChange = (item: string, checked: boolean) => {
    if (checked) {
      onChange?.(value.concat(item));
    } else {
      onChange?.(value.filter((v) => v !== item));
    }
  };

  const onCheckAllChange = (checked: boolean) => {
    onChange?.(checked ? lists : []);
  };
  console.log('lists', lists, value);

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <p className="font-Montserrat text-descM16 text-Neutral-Secondary-Text">
          {value.length} address selected
        </p>
        <div className="flex items-center gap-[16px]">
          <span className="font-Montserrat text-descM16 text-lightGrey">Select All</span>
          <Checkbox onChange={onCheckAllChange} checked={checkAll} />
        </div>
      </div>
      <ul className="flex flex-col gap-4 mb-6">
        {lists?.map((item) => {
          return (
            <li
              key={item}
              className={clsx(
                'w-full flex items-center justify-between border border-solid border-transparent rounded-[8px] p-3',
                value.includes(item) && '!border-mainColor',
              )}
            >
              <span
                className={clsx(
                  'font-Roboto text-[16px] font-normal text-lightGrey',
                  value.includes(item) && 'text-white',
                )}
              >
                {shortenFileName(`ELF_${item}_${curChain}`)}
              </span>
              <Checkbox
                checked={value.includes(item)}
                onChange={(checked) => handleChange(item, checked)}
              ></Checkbox>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default FormDeleteItem;
