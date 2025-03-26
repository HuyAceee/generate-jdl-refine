import { Create } from '@refinedev/antd';
import { Form } from 'antd';

import DatePickerComponent from '~/components/common/DatePickerComponent';
import InputComponent from '~/components/common/InputComponent';
import InputNumberComponent from '~/components/common/InputNumberComponent';
import { InputTagComponent } from '~/components/common/InputTagComponent';
import SelectComponent from '~/components/common/SelectComponent';
import { TextAreaComponent } from '~/components/common/TextAreaComponent';
import { TextEditorComponent } from '~/components/common/TextEditorComponent';
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
    status: StatusEnum.DRAFT,
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
