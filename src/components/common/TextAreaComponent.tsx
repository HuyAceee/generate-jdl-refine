import { Input, Form } from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import clsx from 'clsx';
import React, { ReactNode, useState } from 'react';
import { Controller, Control, FieldValues } from 'react-hook-form';

import InputErrorMessage from './InputErrorMessage';
import LabelInput from './LabelInput';

const { TextArea } = Input;

interface TextAreaComponentProps extends TextAreaProps {
  label?: ReactNode;
  placeholderLines?: string[];
  name: string;
  control: Control<FieldValues>;
}

export const TextAreaComponent: React.FC<TextAreaComponentProps> = ({
  label,
  placeholderLines,
  name,
  control,
  className,
  ...props
}) => {
  const inputClass = clsx(
    'w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
    className,
  );
  const defaultPlaceholderLines = ['Nhập nội dung...'];
  const linesToDisplay = placeholderLines ?? defaultPlaceholderLines;
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Form.Item
      label={<LabelInput label={label ?? name} required={props.required} />}
      rules={[
        {
          required: props.required,
        },
      ]}
    >
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <div className="mb-4">
            <div className="relative">
              <TextArea
                className={inputClass}
                {...field}
                {...props}
                rows={linesToDisplay.length}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              {!isFocused && !field.value && placeholderLines && placeholderLines?.length >= 1 && (
                <div className="pointer-events-none absolute left-4 top-2 text-gray-400">
                  {linesToDisplay.map((line, index) => (
                    <div key={index} className="flex items-center">
                      {linesToDisplay.length > 1 && <span className="mr-2 size-2 rounded-full bg-gray-300"></span>}
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <InputErrorMessage fieldState={fieldState} />
          </div>
        )}
      />
    </Form.Item>
  );
};
