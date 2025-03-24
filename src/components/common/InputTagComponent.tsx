import { Form, Input, Tag } from 'antd';
import clsx from 'clsx';
import { useState } from 'react';
import { Controller } from 'react-hook-form';

import LabelInput from './LabelInput';

interface InputTagComponentProps {
  name: string;
  control: any;
  label?: string;
  required?: boolean;
}

export const InputTagComponent: React.FC<InputTagComponentProps> = ({
  name,
  control,
  label,
  required,
}: InputTagComponentProps) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <Form.Item
      label={<LabelInput label={label ?? name} required={required} />}
      rules={[{ required }]}
      className="w-full"
    >
      <Controller
        name={name}
        control={control}
        defaultValue={[]}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <div>
            <div
              className={clsx(
                'flex min-h-10 flex-wrap gap-1 rounded-md border bg-white p-2',
                error ? 'border-red-500' : 'border-gray-300',
              )}
            >
              {value?.map((tag: string, index: number) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => onChange(value.filter((t: string) => t !== tag))}
                  className="m-0"
                >
                  {tag}
                </Tag>
              ))}

              <Input
                size="small"
                className="w-full border-none focus-within:outline-none focus:outline-none"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onPressEnter={() => {
                  if (inputValue && !value.includes(inputValue)) {
                    onChange([...value, inputValue]);
                  }
                  setInputValue('');
                }}
                placeholder="Enter tag"
              />
            </div>

            {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
          </div>
        )}
      />
    </Form.Item>
  );
};
