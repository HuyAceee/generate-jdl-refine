import { Edit } from '@refinedev/antd';
import { useOne } from '@refinedev/core';
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
import { SampleModel, sampleSchema } from '~/models/pages/sample';
import { enumToOptions } from '~/utils/common';

export const SampleEdit = () => {
  const { data, isLoading } = useOne<SampleModel>({ resource: 'samples' });
  const { control, formProps, saveButtonProps } = useRefineForm(sampleSchema, data?.data);

  return (
    <Edit saveButtonProps={saveButtonProps} isLoading={isLoading}>
      <Form {...formProps} layout="vertical">
        <InputComponent control={control} name="title" />
        <TextEditorComponent control={control} name="content" />
        <TextAreaComponent control={control} name="description" />
        <SelectComponent control={control} resource="news" name="new.id" label="new" />
        <SelectComponent control={control} options={enumToOptions(StatusEnum)} name="status" />
        <InputComponent control={control} name="email" />
        <InputNumberComponent control={control} name="price" />
        <DatePickerComponent control={control} name="dealine" />
        <InputTagComponent control={control} name="tags" />
      </Form>
    </Edit>
  );
};
