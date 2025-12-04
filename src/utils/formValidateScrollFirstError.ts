import { FormInstance } from 'antd';
import { IFormValidateError } from 'types';

export default function formValidateScrollFirstError(
  form: FormInstance,
  error: IFormValidateError,
) {
  if (error?.errorFields?.length) {
    const firstField = error.errorFields[0].name;
    form.scrollToField(firstField);
  }
}
