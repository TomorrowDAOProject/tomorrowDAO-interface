import React, { useEffect, useMemo, useState } from 'react';
import { message, Form } from 'antd';
import { useRequest } from 'ahooks';
import { Typography } from 'aelf-design';
import { SkeletonList } from 'components/Skeleton';
import { fetchDaoInfo } from 'api/request';
import Upload from 'components/Upload';
import IPFSUpload from 'components/IPFSUpload';
import { emitLoading, eventBus, ResultModal } from 'utils/myEvent';
import { curChain, daoAddress, NetworkDaoHomePathName } from 'config';
import { mediaList } from 'app/(createADao)/create/component/BasicDetails';
import { cx } from 'antd-style';
import { mediaValidatorMap } from 'app/(createADao)/create/component/utils';
import { callContract } from 'contract/callContract';
import ErrorResult from 'components/ErrorResult';
import './index.css';
import { ButtonCheckLogin } from 'components/ButtonCheckLogin';
import { CommonOperationResultModalType } from 'components/CommonOperationResultModal';
import { IContractError } from 'types';
import Link from 'next/link';
import { INIT_RESULT_MODAL_CONFIG } from 'components/ResultModal';
import formValidateScrollFirstError from 'utils/formValidateScrollFirstError';
import breadCrumb from 'utils/breadCrumb';
import Input from 'components/Input';
import TextArea from 'components/Textarea';
import FormItem from 'components/FormItem';
import Button from 'components/Button';

interface IEditDaoProps {
  daoId?: string;
  aliasName?: string;
  isNetworkDAO?: boolean;
}

const FILE_LIMIT = '20 MB';
const ANTD_UPLOAD_DONE_STATUS = 'done';
const MAX_FILE_COUNT = 20;
const MAX_FILE_NAME_LENGTH = 128;

const EditDao: React.FC<IEditDaoProps> = (props) => {
  const { isNetworkDAO, aliasName } = props;
  const [deletedFile, setDeletedFile] = useState<string[]>([]);
  const [mediaError, setMediaError] = useState<boolean>(false);
  const [form] = Form.useForm();
  const {
    data: daoData,
    error: daoError,
    loading: daoLoading,
  } = useRequest(async () => {
    if (!aliasName && !props.daoId) {
      message.error('aliasName or daoId is required');
      return null;
    }
    return fetchDaoInfo({ daoId: props.daoId, chainId: curChain, alias: aliasName });
  });
  const daoId = daoData?.data?.id;
  const handleSave = async () => {
    const res = await form?.validateFields().catch((err) => {
      formValidateScrollFirstError(form, err);
      return null;
    });
    if (!res) return;
    const socialMedia: Record<string, string> = Object.keys(res.metadata.socialMedia).reduce(
      (acc: Record<string, string>, key: string) => {
        if (res.metadata.socialMedia[key]) {
          acc[key] = res.metadata.socialMedia[key];
        }
        return acc;
      },
      {},
    );
    const params = {
      daoId,
      metadata: {
        logoUrl: res.metadata.logoUrl[0].url,
        description: res.metadata.description,
        socialMedia,
      },
    };

    const newFile = res?.files
      .filter((item: Record<string, string>) => item && item.cid === undefined)
      .map((item: Record<string, string>) => {
        const url = new URL(item.url);
        const id = url.pathname.split('/').pop() ?? '';
        console.log('ididid', id);
        return {
          cid: id,
          name: item.name,
          url: item.url,
        };
      });

    console.log('newFile2111', newFile);

    try {
      console.log('deletedFile', deletedFile);
      emitLoading(true, 'The changes is being processed...');
      if (deletedFile.length > 0) {
        await callContract(
          'RemoveFileInfos',
          {
            daoId,
            fileCids: deletedFile,
          },
          daoAddress,
        );
      }
      if (newFile?.length > 0) {
        await callContract(
          'UploadFileInfos',
          {
            daoId,
            files: newFile,
          },
          daoAddress,
        );
      }

      await callContract('UpdateMetadata', params, daoAddress);
      emitLoading(false);
      console.log('eventBus.emit');
      eventBus.emit(ResultModal, {
        open: true,
        type: CommonOperationResultModalType.Success,
        primaryContent: 'The changes have been submitted successfully.',
        footerConfig: {
          buttonList: [
            {
              onClick: () => {
                eventBus.emit(ResultModal, INIT_RESULT_MODAL_CONFIG);
              },
              children: (
                <Link
                  className="w-full"
                  href={isNetworkDAO ? `${NetworkDaoHomePathName}` : `/dao/${aliasName}`}
                >
                  <Button type="primary" className="text-white w-full">
                    View The DAO
                  </Button>
                </Link>
              ),
            },
          ],
        },
      });
    } catch (error) {
      const err = error as IContractError;
      emitLoading(false);
      eventBus.emit(ResultModal, {
        open: true,
        type: CommonOperationResultModalType.Error,
        primaryContent: 'Save Changes Error',
        secondaryContent: err?.errorMessage?.message || err?.message,
        footerConfig: {
          buttonList: [
            {
              children: (
                <Button className="w-full" type="primary">
                  OK
                </Button>
              ),
              onClick: () => {
                eventBus.emit(ResultModal, INIT_RESULT_MODAL_CONFIG);
              },
            },
          ],
        },
      });
    }
  };
  useEffect(() => {
    breadCrumb.updateSettingPage(aliasName);
  }, [aliasName]);
  // recover from api response
  useEffect(() => {
    if (!daoData?.data) return;
    const {
      metadata: { name, logoUrl, description, socialMedia },
      fileInfoList,
    } = daoData.data ?? {};
    form.setFieldsValue({
      metadata: {
        name,
        logoUrl: [
          {
            uid: '3',
            name: 'logo.png',
            status: ANTD_UPLOAD_DONE_STATUS,
            url: logoUrl,
          },
        ],
        description,
        socialMedia: {
          Twitter: socialMedia.Twitter,
          Facebook: socialMedia.Facebook,
          Telegram: socialMedia.Telegram,
          Discord: socialMedia.Discord,
          Reddit: socialMedia.Reddit,
        },
      },
      files: fileInfoList.map(({ file }) => ({
        uid: file.cid,
        status: ANTD_UPLOAD_DONE_STATUS,
        ...file,
      })),
    });
  }, [form, daoData]);

  const fileList = Form.useWatch('files', form) ?? [];

  const [files, setFiles] = useState([]);

  useEffect(() => {
    setFiles(fileList);
  }, [fileList]);

  const metadata = Form.useWatch('metadata', form);

  const [metaData, setMetaData] = useState({ logoUrl: [{ url: '' }] });

  useEffect(() => {
    setMetaData(metadata);
  }, [metadata]);

  const isUploadDisabled = useMemo(() => {
    return fileList.length >= MAX_FILE_COUNT;
  }, [fileList.length]);

  const uploadTips = useMemo(() => {
    if (isUploadDisabled) {
      return (
        <p>
          You have reached the maximum limit of {MAX_FILE_COUNT} files. Please consider removing
          some files before uploading a new one. If you need further assistance, you can join
          TMRWDAO&apos;s
          <a href="https://t.me/tmrwdao" target="_blank" rel="noreferrer" className="px-[4px]">
            Telegram
          </a>
          group.
        </p>
      );
    } else {
      return (
        <>
          <p>Format supported: PDF.</p>
          <p>Size: Less than {FILE_LIMIT}. </p>
        </>
      );
    }
  }, [isUploadDisabled]);

  return (
    <div className="dao-edit">
      {daoError && <ErrorResult />}
      {daoLoading ? (
        <SkeletonList />
      ) : (
        <>
          <Form
            layout="vertical"
            name="baseInfo"
            scrollToFirstError={true}
            autoComplete="off"
            form={form}
          >
            <Form.Item
              className="mb-[50px]"
              name={['metadata', 'name']}
              validateFirst
              rules={[
                {
                  required: true,
                  message: 'The name is required',
                },
                {
                  type: 'string',
                  max: 50,
                  message: 'The name should contain no more than 50 characters.',
                },
              ]}
              label="Name"
            >
              <Input placeholder="Enter a name for the DAO" disabled />
            </Form.Item>
            <div className="flex items-start justify-between flex-col md:flex-row lg:flex-row xl:flex-row md:gap-[50px] lg:gap-[50px] xl:gap-[50px] mb-[18px]">
              <Form.Item
                className="w-full md:w-[250px] lg:w-[250px] xl:w-[250px]"
                name={['metadata', 'logoUrl']}
                valuePropName="fileList"
                rules={[
                  {
                    required: true,
                    message: 'Logo is required',
                  },
                ]}
                label={<span id="baseInfo_metadata_logoUrl">Logo</span>}
              >
                <Upload
                  className="w-full md:w-[250px] lg:w-[250px] xl:w-[250px] h-[250px]"
                  needCheckImgSize
                  accept=".png,.jpg"
                  value={metaData?.logoUrl[0]?.url}
                  uploadText="Click to Upload"
                  tips={`Formats supported: PNG, JPG, JPEG \nRatio: 1:1 , less than 1 MB`}
                  onFinish={(file) => {
                    console.log('file', file);
                    form.setFieldsValue({
                      metadata: {
                        logoUrl: [{ url: file.url }],
                      },
                    });
                  }}
                />

                {/* <IPFSUpload
                  className="w-full md:w-[250px] lg:w-[250px] xl:w-[250px] h-[250px] flex-shrink-0 !bg-transparent"
                  maxFileCount={1}
                  needCheckImgSize
                  accept=".png,.jpg"
                  uploadText="Click to Upload"
                  uploadIconColor="#1A1A1A"
                  tips="Formats supported: PNG and JPG. Ratio: 1:1 , less than 1 MB."
                /> */}
              </Form.Item>
              <Form.Item
                className="w-full"
                validateFirst
                rules={[
                  {
                    required: true,
                    message: 'description is required',
                  },
                  {
                    type: 'string',
                    max: 240,
                    message: 'The description should contain no more than 240 characters.',
                  },
                ]}
                name={['metadata', 'description']}
                label="Description"
              >
                <TextArea
                  containerClassName="Description-textArea"
                  maxLength={240}
                  placeholder={`Enter the mission and vision of the DAO (240 characters max). This can be modified after DAO is created.`}
                  onChange={(value) => {
                    console.log(value);
                  }}
                />
              </Form.Item>
            </div>

            <Form.Item
              className="mb-6"
              name={['metadata', 'socialMedia', 'title']}
              dependencies={mediaList}
              rules={[
                ({ getFieldValue }) => ({
                  validator() {
                    const metadata = mediaList.map((item) => getFieldValue(item));
                    const values = Object.values(metadata);
                    const checked = values.some((item) => item);
                    if (checked) {
                      setMediaError(false);
                      return Promise.resolve();
                    }
                    setMediaError(true);
                    return Promise.reject(new Error(''));
                  },
                }),
              ]}
              label=""
            >
              {/* <div
                className="mt-8 text-white font-Montserrat"
                id="baseInfo_metadata_socialMedia_title"
              >
                Social Media
              </div>
              <div className={cx('Media-info', mediaError && '!text-Reject-Reject')}>
                At least one social media is required.
              </div> */}
              <div className="text-white font-Montserrat text-[16px] font-medium">Links</div>
              <div className="text-lightGrey text-[13px] my-[25px] font-Montserrat">
                Links to your DAO’s website, social media profiles, discord, or other places your
                community gathers.
              </div>
            </Form.Item>
            <Form.Item
              name={['metadata', 'socialMedia', 'Twitter']}
              validateFirst
              rules={[
                ...mediaValidatorMap.Twitter.validator,
                {
                  type: 'string',
                  max: 16,
                  message: 'The X (Twitter) user name should be shorter than 15 characters.',
                },
              ]}
              label={
                <span className="font-Montserrat text-white text-[14px] font-medium">
                  X (Twitter)
                </span>
              }
            >
              <Input placeholder={`@`} />
            </Form.Item>
            <Form.Item
              name={['metadata', 'socialMedia', 'Facebook']}
              validateFirst
              rules={[
                ...mediaValidatorMap.Link.validator,
                {
                  type: 'string',
                  max: 128,
                  message: 'The URL should be shorter than 128 characters.',
                },
              ]}
              label={
                <span className="font-Montserrat text-white text-[14px] font-medium">Facebook</span>
              }
            >
              <Input placeholder={`https://`} />
            </Form.Item>
            <Form.Item
              name={['metadata', 'socialMedia', 'Discord']}
              validateFirst
              rules={[
                ...mediaValidatorMap.Link.validator,
                {
                  type: 'string',
                  max: 128,
                  message: 'The URL should be shorter than 128 characters.',
                },
              ]}
              label={
                <span className="font-Montserrat text-white text-[14px] font-medium">Discord</span>
              }
            >
              <Input placeholder={'https://'} />
            </Form.Item>
            <Form.Item
              name={['metadata', 'socialMedia', 'Telegram']}
              validateFirst
              rules={[
                ...mediaValidatorMap.Link.validator,
                {
                  type: 'string',
                  max: 128,
                  message: 'The URL should be shorter than 128 characters.',
                },
              ]}
              label={
                <span className="font-Montserrat text-white text-[14px] font-medium">Telegram</span>
              }
            >
              <Input placeholder={`https://`} />
            </Form.Item>
            <Form.Item
              name={['metadata', 'socialMedia', 'Reddit']}
              validateFirst
              rules={[
                ...mediaValidatorMap.Link.validator,
                {
                  type: 'string',
                  max: 128,
                  message: 'The URL should be shorter than 128 characters.',
                },
              ]}
              label={<span className="font-Montserrat text-white text-[14px]">Reddit</span>}
            >
              <Input placeholder={`https://`} />
            </Form.Item>
            {/* <Form.Item
              name={['metadata', 'socialMedia', 'Github']}
              validateFirst
              rules={[
                ...mediaValidatorMap.Link.validator,
                {
                  type: 'string',
                  max: 128,
                  message: 'The URL should be shorter than 128 characters.',
                },
              ]}
              label={
                <span className="font-Montserrat text-white text-[14px] font-medium">Github</span>
              }
            >
              <Input placeholder={`Enter the DAO's Github link`} />
            </Form.Item>
            <Form.Item
              name={['metadata', 'socialMedia', 'Others']}
              validateFirst
              rules={[
                ...mediaValidatorMap.Link.validator,
                {
                  type: 'string',
                  max: 128,
                  message: 'The URL should be shorter than 128 characters.',
                },
              ]}
              label={
                <span className="font-Montserrat text-white text-[14px] font-medium">Others</span>
              }
            >
              <Input placeholder={`Enter the DAO's Others link`} />
            </Form.Item> */}
            <div className="text-white text-[16px] font-medium font-Montserrat">Documentation</div>
            <div
              className={cx(
                'text-lightGrey my-[15px] text-[12px] font-Montserrat',
                mediaError && '!text-Reject-Reject',
              )}
            >
              It is recommended to upload at least a project whitepaper and roadmap
            </div>
            <Form.Item
              name="files"
              validateFirst
              className="mb-8"
              valuePropName="fileList"
              initialValue={[]}
            >
              <div>
                <Upload
                  className="upload"
                  accept=".pdf"
                  fileLimit={FILE_LIMIT}
                  fileNameLengthLimit={MAX_FILE_NAME_LENGTH}
                  uploadText="Click to Upload"
                  tips={uploadTips}
                  onFinish={(file) => {
                    const currentValues = fileList;

                    const regex = /\/ipfs\/([^/?]+)/;
                    const match = file.url.match(regex);

                    const realFile = {
                      name: file.name,
                      vid: match && match[1],
                      url: file.url,
                      status: 'done',
                    };

                    form.setFieldsValue({
                      files: [...currentValues, realFile],
                    });
                  }}
                />
                {files.length > 0 &&
                  files.map(
                    (
                      file: {
                        cid: string;
                        vid: string;
                        uid: string;
                        name: string;
                        url: string;
                      },
                      index,
                    ) => {
                      return (
                        <div
                          key={index}
                          className="text-white font-Montserrat flex items-center justify-between py-1 px-2 mt-2"
                        >
                          <div className="flex items-center gap-1">
                            <i className="text-lightGrey tmrwdao-icon-document text-[20px]"></i>
                            <span>{file.name}</span>
                          </div>
                          <i
                            className="tmrwdao-icon-delete text-[22px] text-Neutral-Secondary-Text"
                            onClick={() => {
                              if (file) {
                                if (file.cid) {
                                  setDeletedFile([...deletedFile, file.cid]);
                                }
                                const newFiles = fileList.filter(
                                  (list: { url: string }) => list.url !== file.url,
                                );

                                form.setFieldsValue({
                                  files: newFiles,
                                });
                              }
                            }}
                          ></i>
                        </div>
                      );
                    },
                  )}
              </div>

              {/* <IPFSUpload
                className="upload bg-black"
                isAntd
                accept=".pdf"
                fileLimit={FILE_LIMIT}
                maxCount={MAX_FILE_COUNT}
                fileNameLengthLimit={MAX_FILE_NAME_LENGTH}
                uploadIconColor="#1A1A1A"
                uploadText={'Click to Upload'}
                tips={uploadTips}
                disabled={isUploadDisabled}
                onRemove={(item) => {
                  if (item.url) {
                    const url = new URL(item.url);
                    const id = url.pathname.split('/').pop() ?? '';
                    setDeletedFile([...deletedFile, id]);
                  }
                }}
              /> */}
            </Form.Item>
          </Form>
          <div className="flex justify-end">
            <ButtonCheckLogin
              className="font-Montserrat !text-[15px] !h-[40px] text-white bg-mainColor border border-solid hover:!bg-transparent hover:!border-mainColor hover:!text-mainColor !rounded-[42px]"
              onClick={handleSave}
              type="primary"
            >
              Save changes
            </ButtonCheckLogin>
          </div>
        </>
      )}
    </div>
  );
};

export default EditDao;
