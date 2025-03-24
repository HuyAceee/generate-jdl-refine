import MDEditor, { MDEditorProps } from '@uiw/react-md-editor';
import { Form } from 'antd';
import React, { ReactNode } from 'react';
import { Controller, Control, FieldValues } from 'react-hook-form';

import InputErrorMessage from './InputErrorMessage';
import LabelInput from './LabelInput';

interface TextEditorProps extends MDEditorProps {
  label?: ReactNode;
  control: Control<FieldValues>;
  name: string;
  required?: boolean;
}

export const TextEditorComponent: React.FC<TextEditorProps> = ({ label, name, control, required, ...props }) => {
  return (
    <Form.Item
      label={<LabelInput label={label ?? name} required={required} />}
      rules={[
        {
          required,
        },
      ]}
    >
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <MDEditor data-color-mode="light" {...field} {...props} />
            <InputErrorMessage fieldState={fieldState} />
          </>
        )}
      />
    </Form.Item>
  );
};
