import { Create } from '@refinedev/antd';
import { Form } from 'antd';

import {
  InputComponent,
  TextEditorComponent,
  TextAreaComponent,
  SelectComponent,
  InputNumberComponent,
  DatePickerComponent,
  InputTagComponent,
} from '~/components/common';
import { useRefineForm } from '~/hooks/useRefineForm';
import { StatusEnum } from '~/models/common/enum';
import { sampleSchema } from '~/models/pages/sample';
import { enumToOptions } from '~/utils/common';

export const SampleCreate = () => {
  const { control, formProps, saveButtonProps } = useRefineForm(sampleSchema, {
    title: '',
    content: '',
    description: '',
    new: { id: '' },
    status: StatusEnum.ACTIVE,
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <InputComponent control={control} name="title" required />
        <TextEditorComponent control={control} name="content" required />
        <TextAreaComponent control={control} name="description" required />
        <SelectComponent control={control} resource="news" name="new.id" label="new" required labelField="title" />
        <SelectComponent control={control} options={enumToOptions(StatusEnum)} name="status" required />
        <InputComponent control={control} name="email" />
        <InputNumberComponent control={control} name="price" />
        <DatePickerComponent control={control} name="dealine" label="Dealine" />
        <InputTagComponent control={control} name="tags" />
      </Form>
    </Create>
  );
};
