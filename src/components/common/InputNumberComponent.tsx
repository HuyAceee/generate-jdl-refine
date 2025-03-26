import { InputNumber as AntInput, Form } from 'antd';
import { InputNumberProps } from 'antd/lib';
import clsx from 'clsx';
import React from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';

import InputErrorMessage from './InputErrorMessage';
import LabelInput from './LabelInput';

interface InputNumberComponentProps extends InputNumberProps {
  required?: boolean;
  className?: string;
  name: string;
  control: Control<FieldValues, {}>;
}

const InputNumberComponent: React.FC<InputNumberComponentProps> = ({
  required,
  className,
  name,
  control,
  ...props
}) => {
  return (
    <div className="mb-1">
      <Form.Item
        label={<LabelInput label={props.title ?? name} required={required} />}
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
            <div>
              <AntInput {...props} className={clsx('h-12 w-full rounded-2xl', className)} {...field} />
              <InputErrorMessage fieldState={fieldState} />
            </div>
          )}
        />
      </Form.Item>
    </div>
  );
};

export default InputNumberComponent;
