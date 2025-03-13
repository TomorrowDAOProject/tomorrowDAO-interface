import { useContext, useEffect } from 'react';
import { StepEnum, StepsContext } from '../../type';
import { UseFormReturn } from 'react-hook-form';

export const useRegisterForm = (form: UseFormReturn<any>, stepEnum: StepEnum) => {
  const { stepForm, onRegister } = useContext(StepsContext);
  useEffect(() => {
    onRegister?.(form);
    if (stepForm[stepEnum].submitedRes) {
      form.reset(stepForm[stepEnum].submitedRes);
    }
  }, [form, onRegister, stepEnum, stepForm]);
};
