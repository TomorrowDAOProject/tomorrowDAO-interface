import clsx from 'clsx';
import Button from 'components/Button';
import Input from 'components/Input';
import Select, { SelectOption } from 'components/Select';
import { LINK_TYPE } from 'constants/dao';
import { useEffect, useState } from 'react';
import { urlRegex, twitterUsernameRegex } from '../utils';
import { SocialMedia } from 'types/dao';

interface ILinkGroupProps {
  value: SocialMedia;
  errorText?: string;
  onBlur?(links: [string, string][]): void;
  onChange?(links: [string, string][]): void;
}

const socialMedia = [
  {
    label: 'X (Twitter)',
    value: LINK_TYPE.TWITTER,
  },
  {
    label: 'Facebook',
    value: LINK_TYPE.FACEBOOK,
  },
  {
    label: 'Github',
    value: LINK_TYPE.GITHUB,
  },
  {
    label: 'Discord',
    value: LINK_TYPE.DISCORD,
  },
  {
    label: 'Telegram',
    value: LINK_TYPE.TELEGRAM,
  },
  {
    label: 'Reddit',
    value: LINK_TYPE.REDDIT,
  },
  {
    label: 'Others',
    value: LINK_TYPE.OTHERS,
  },
];

const LinkGroup = ({ value, errorText, onBlur, onChange }: ILinkGroupProps) => {
  const [linkData, setLinkData] = useState<[string, string][]>([['', '']]);
  const handleSelectChange = (option: SelectOption, index: number) => {
    const originLinks = [...linkData];
    originLinks[index][0] = option.value as string;
    setLinkData(originLinks);
    onChange?.(originLinks);
  };

  const handleInputChange = (value: string, index: number) => {
    const originLinks = [...linkData];
    originLinks[index][1] = value;
    setLinkData(originLinks);
    onChange?.(originLinks);
  };

  const addLink = () => {
    const originLinks: [string, string][] = [...linkData, ['', '']];
    setLinkData(originLinks);
  };

  const removeLink = (index: number) => {
    let originLinks = [...linkData];
    if (linkData.length === 1) {
      originLinks = [['', '']];
    } else {
      originLinks.splice(index, 1);
    }
    setLinkData(originLinks);
    onChange?.(originLinks);
  };

  useEffect(() => {
    if (Array.isArray(value)) {
      setLinkData(value);
    }
  }, [value]);

  return (
    <>
      {linkData?.map((link, index) => (
        <div
          className={clsx('flex flex-col lg:flex-row gap-6', {
            'mb-6': index < linkData.length - 1,
          })}
          key={`${link[0]}_${index}`}
        >
          <Select
            label="Name"
            value={link[0]}
            placeholder="Select Social Media"
            className="lg:w-[250px]"
            options={socialMedia}
            onChange={(option) => handleSelectChange(option, index)}
            isError={!link[0] && !!link[1]}
          />
          <div className="flex flex-col flex-grow">
            <span className="block mb-[10px] text-descM14 font-Montserrat text-white">Link</span>
            <div className="flex flex-row flex-grow items-center">
              <Input
                className="flex-1"
                placeholder={
                  link[0] === LINK_TYPE.TWITTER
                    ? "Enter the DAO's X handle, starting with @"
                    : 'https://'
                }
                value={link[1]}
                onBlur={() => onBlur?.(linkData)}
                onChange={(value) => handleInputChange(value, index)}
                isError={
                  !!link[0] &&
                  ((link[0] === LINK_TYPE.TWITTER && !twitterUsernameRegex.test(link[1])) ||
                    (link[0] !== LINK_TYPE.TWITTER && !urlRegex.test(link[1])))
                }
              />
              <i
                className={
                  'tmrwdao-icon-circle-minus text-white text-[22px] ml-[6px] cursor-pointer'
                }
                onClick={() => removeLink(index)}
              />
            </div>
          </div>
        </div>
      ))}
      {errorText && (
        <span className="mt-[5px] block text-[11px] font-Montserrat leading-[17.6px] text-mainColor">
          {errorText}
        </span>
      )}

      <Button className="mt-4 !py-[4px] !text-[12px] w-[107px]" size="small" onClick={addLink}>
        <i className="tmrwdao-icon-circle-add text-[22px] mr-[6px]" />
        Add link
      </Button>
    </>
  );
};

export default LinkGroup;
