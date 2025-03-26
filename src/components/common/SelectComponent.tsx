import { useList } from '@refinedev/core';
import { Select, Spin, Form } from 'antd';
import { SelectProps } from 'antd/lib/select';
import React from 'react';
import { Control, Controller } from 'react-hook-form';

import InputErrorMessage from './InputErrorMessage';
import LabelInput from './LabelInput';

import { SelectOptionModel } from '~/models/common';

interface SelectComponentProps extends SelectProps {
  control: Control;
  resource?: string;
  label?: string;
  valueField?: string;
  labelField?: string;
  required?: boolean;
  options?: SelectOptionModel[];
  name: string;
}

const SelectComponent: React.FC<SelectComponentProps> = ({
  control,
  resource,
  label,
  valueField = 'id',
  labelField = 'name',
  required,
  options,
  name,
  ...props
}) => {
  const { data, isLoading } = useList({
    resource,
    queryOptions: {
      enabled: !options?.length,
    },
  });

  const items: SelectOptionModel[] = options?.length
    ? options
    : data?.data?.map(item => ({
        id: item[valueField],
        name: item[labelField],
      })) ?? [];

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
            <Select
              {...field}
              {...props}
              loading={isLoading}
              placeholder={`Select ${label}`}
              options={items}
              showSearch
              fieldNames={{ label: labelField, value: valueField }}
              notFoundContent={isLoading ? <Spin size="small" /> : 'No options found'}
              className="size-full h-12 max-h-20 rounded-2xl"
            />
            <InputErrorMessage fieldState={fieldState} />
          </>
        )}
      />
    </Form.Item>
  );
};

export default SelectComponent;
