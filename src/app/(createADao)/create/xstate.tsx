import { StateNode, assign, createMachine } from 'xstate';
import BasicDetails from './component/BasicDetails';
import GovernanceModel from './component/GovernanceModel';
import ContractsAndFiles from './component/ContractsAndFiles';
import HighCouncil from './component/HighCouncil';

export type TView = {
  Component: React.ReactNode;
  step: number;
};

export type TState = {
  states: {
    basicDetails: StateNode;
    governanceModel: StateNode;
    highCouncil: StateNode;
    contractsAndFiles: StateNode;
  };
};

export const mapNameToView: Record<string, TView> = {
  basicDetails: {
    Component: <BasicDetails />,
    step: 0,
  },
  governanceModel: {
    Component: <GovernanceModel />,
    step: 1,
  },
  highCouncil: {
    Component: <HighCouncil />,
    step: 2,
  },
  contractsAndFiles: {
    Component: <ContractsAndFiles />,
    step: 3,
  },
};
// todo
// const initialStateName = 'basicDetails';
const initialStateName = 'contractsAndFiles';

const formMachineConfig = {
  types: {} as {
    context: {
      currentView: TView;
    };
  },
  id: 'createState',
  initial: initialStateName,
  context: {
    currentView: mapNameToView[initialStateName],
  },
  states: {
    basicDetails: {
      entry: assign({
        currentView: () => {
          return mapNameToView['basicDetails'];
        },
      }),
      on: {
        NEXT: {
          target: 'governanceModel',
          actions: assign({
            currentView: () => {
              return mapNameToView['governanceModel'];
            },
          }),
        },
      },
    },
    governanceModel: {
      on: {
        PREVIOUS: {
          target: 'basicDetails',
          actions: assign({
            currentView: () => {
              return mapNameToView['basicDetails'];
            },
          }),
        },
        NEXT: {
          target: 'highCouncil',
          actions: assign({
            currentView: () => {
              return mapNameToView['highCouncil'];
            },
          }),
        },
      },
    },
    highCouncil: {
      on: {
        PREVIOUS: {
          target: 'governanceModel',
          actions: assign({
            currentView: () => {
              return mapNameToView['governanceModel'];
            },
          }),
        },
        NEXT: {
          target: 'contractsAndFiles',
          actions: assign({
            currentView: () => {
              return mapNameToView['contractsAndFiles'];
            },
          }),
        },
      },
    },
    contractsAndFiles: {
      on: {
        PREVIOUS: {
          target: 'highCouncil',
          actions: assign({
            currentView: () => {
              return mapNameToView['highCouncil'];
            },
          }),
        },
      },
    },
  },
};

export const formMachine = createMachine(formMachineConfig as any);
