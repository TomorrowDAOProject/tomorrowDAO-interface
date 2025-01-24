import clsx from 'clsx';
import Button from 'components/Button';
import Input from 'components/Input';
import Select, { SelectOption } from 'components/Select';
import { LINK_TYPE } from 'constants/dao';
import { useEffect, useState } from 'react';
import { facebookUrlRegex, twitterUsernameRegex } from '../utils';
import { validate } from 'graphql';
import { SocialMedia } from 'types/dao';

interface ILinkGroupProps {
  value: SocialMedia;
  errorText?: string;
  onBlur?(links: Record<string, number>): void;
  onChange?(links: Record<string, number>): void;
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
  const [linkData, setLinkData] = useState<string[][]>([['', '']]);
  const handleSelectChange = (option: SelectOption, index: number) => {
    const originLinks = [...linkData];
    originLinks[index][0] = option.value;
    setLinkData(originLinks);
    const socialMedia = Object.fromEntries(originLinks);
    onChange?.(socialMedia);
  };

  const handleInputChange = (value: string, index: number) => {
    const originLinks = [...linkData];
    originLinks[index][1] = value;
    setLinkData(originLinks);
    const socialMedia = Object.fromEntries(originLinks);
    onChange?.(socialMedia);
  };

  const addLink = () => {
    const originLinks = [...linkData, ['', '']];
    setLinkData(originLinks);
  };

  const removeLink = (index: number) => {
    if (linkData.length <= 1) return;
    const originLinks = [...linkData];
    originLinks.splice(index, 1);
    setLinkData(originLinks);
  };

  useEffect(() => {
    const values: string[][] = [];
    Object.entries(value).forEach(([key, val]) => {
      values.push([key, val]);
    });
    setLinkData(values);
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
            placehoder="Select Social Media"
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
                onBlur={() => onBlur?.(Object.fromEntries(linkData))}
                onChange={(value) => handleInputChange(value, index)}
                isError={
                  !!link[0] &&
                  !!link[1] &&
                  ((link[0] === LINK_TYPE.TWITTER && !twitterUsernameRegex.test(link[1])) ||
                    (link[0] !== LINK_TYPE.TWITTER && !facebookUrlRegex.test(link[1])))
                }
              />
              <i
                className={clsx(
                  'tmrwdao-icon-circle-minus text-white text-[22px] ml-[6px] cursor-pointer',
                  {
                    '!text-darkGray': linkData.length <= 1,
                  },
                )}
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

      <Button className="mt-4 !py-[2px] !text-[12px]" onClick={addLink}>
        <i className="tmrwdao-icon-circle-add text-[22px] mr-[6px]" />
        Add link
      </Button>
    </>
  );
};

export default LinkGroup;
