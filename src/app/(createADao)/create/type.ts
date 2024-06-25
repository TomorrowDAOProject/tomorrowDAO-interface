import { FormInstance, UploadFile } from 'antd';
import { createContext } from 'react';

export enum GovernanceModelType {
  Fixed = 'Fixed',
  Flexible = 'Flexible',
}

export interface IGovernanceSchemeThreshold {
  minimalRequiredThreshold: number;
  minimalVoteThreshold: number;
  minimalApproveThreshold: number; // percentage
  maximalRejectionThreshold: number; // percentage
  maximalAbstentionThreshold: number; // percentage
  proposalThreshold: number;
}

export interface IHighCouncilConfig {
  maxHighCouncilMemberCount: number;
  maxHighCouncilCandidateCount: number;
  electionPeriod: number;
  stakingAmount: number;
}

export interface IHighCouncilInput {
  highCouncilConfig: IHighCouncilConfig;
  governanceSchemeThreshold: IGovernanceSchemeThreshold;
  members: IAddressList;
}
export interface IMetadata {
  name: string;
  logoUrl: UploadFile[];
  description: string; // 240
  // title does not need to be submitted
  socialMedia: Record<string, string>; // Twitter, Facebook, Discord, Telegram, Reddit, title
}
export interface IFile {
  cid: string; // id
  name: string; //
  url: string; //
}
// DAO create params
export interface ICreateDAOInput {
  // step 0
  metadata: Omit<IMetadata, 'logo_url'> & { logo_url: string };
  governanceToken: string;
  // step 1
  governanceSchemeThreshold: IGovernanceSchemeThreshold;
  // step 2 optional
  highCouncilInput?: IHighCouncilInput;
  // step 3
  files: IFile[];
}
export enum StepEnum {
  step0 = '0',
  step1 = '1',
  step2 = '2',
  step3 = '3',
}
export enum EDaoGovernanceMechanism {
  'Token' = 0,
  'Multisig' = 2,
}
interface IAddressList {
  value: string[];
}
export interface BasicInfoSubmitedRes {
  metadata: IMetadata;
  governanceToken: string;
  governanceMechanism: EDaoGovernanceMechanism;
  members: IAddressList;
}
export interface FilesSubmitedRes {
  files: UploadFile[];
}
interface StepsFormMap {
  [StepEnum.step0]: {
    submitedRes?: BasicInfoSubmitedRes;
    formInstance?: FormInstance;
  };
  [StepEnum.step1]: {
    submitedRes?: IGovernanceSchemeThreshold;
    formInstance?: FormInstance;
  };
  [StepEnum.step2]: {
    submitedRes?: IHighCouncilInput;
    formInstance?: FormInstance;
  };
  [StepEnum.step3]: {
    submitedRes?: FilesSubmitedRes;
    formInstance?: FormInstance;
  };
}
// todo
export const defaultStepsFormMap = {
  stepForm: {
    [StepEnum.step0]: {},
    [StepEnum.step1]: {},
    [StepEnum.step2]: {},
    [StepEnum.step3]: {},
  },
  onRegister: () => undefined,
  isShowHighCouncil: false,
};
export interface IStepsContext {
  stepForm: StepsFormMap;
  onRegister: (ins: FormInstance) => void;
  isShowHighCouncil: boolean;
}

export const StepsContext = createContext<IStepsContext>(defaultStepsFormMap);
