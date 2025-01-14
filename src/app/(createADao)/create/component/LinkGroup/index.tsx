import clsx from 'clsx';
import Button from 'components/Button';
import Input from 'components/Input';
import Select, { SelectOption } from 'components/Select';
import { useState } from 'react';

type LinkItem = {
  name: string;
  value: string;
};

interface ILinkGroupProps {
  links: LinkItem[];
  onChange?(links: LinkItem[]): void;
}

const socialMedia = [
  {
    label: 'X (Twitter)',
    value: 'Twitter',
  },
  {
    label: 'Facebook',
    value: 'Facebook',
  },
  {
    label: 'Discord',
    value: 'Discord',
  },
  {
    label: 'Telegram',
    value: 'Telegram',
  },
  {
    label: 'Reddit',
    value: 'Reddit',
  },
];

const LinkGroup: React.FC<ILinkGroupProps> = ({ links, onChange }) => {
  const [linkData, setLinkData] = useState<LinkItem[]>(links);
  const handleSelectChange = (option: SelectOption, index: number) => {
    const originLinks = [...linkData];
    originLinks[index].name = option.value;
    setLinkData(originLinks);
    onChange?.(originLinks);
  };

  const handleInputChange = (value: string, index: number) => {
    const originLinks = [...linkData];
    originLinks[index].value = value;
    setLinkData(originLinks);
    onChange?.(originLinks);
  };

  const addLink = () => {
    const originLinks = [...linkData, { name: '', value: '' }];
    setLinkData(originLinks);
    onChange?.(originLinks);
  };

  const removeLink = () => {
    if (links.length <= 1) return;
    const originLinks = [...links];
    originLinks.pop();
    setLinkData(originLinks);
    onChange?.(originLinks);
  };

  return (
    <div className="mb-[50px]">
      {linkData?.map((link, index) => (
        <div className="mb-6 flex flex-col md:flex-row gap-6" key={`${link.name}_${index}`}>
          <Select
            label="Name"
            placehoder="Select Social Media"
            className="w-[250px]"
            options={socialMedia}
            onChange={(option) => handleSelectChange(option, index)}
          />
          <div className="flex flex-col flex-grow">
            <span className="block mb-[10px] text-descM14 font-Montserrat text-white">Link</span>
            <div className="flex flex-row flex-grow items-center">
              <Input className="flex-1" onChange={(value) => handleInputChange(value, index)} />
              <i
                className={clsx(
                  'tmrwdao-icon-circle-minus text-white text-[22px] ml-[6px] cursor-pointer',
                  {
                    'text-darkGray': links.length <= 1,
                  },
                )}
                onClick={removeLink}
              />
            </div>
          </div>
        </div>
      ))}

      <Button className="!py-[2px] !text-[12px]" onClick={addLink}>
        <i className="tmrwdao-icon-circle-add text-[22px] mr-[6px]" />
        Add link
      </Button>
    </div>
  );
};

export default LinkGroup;
