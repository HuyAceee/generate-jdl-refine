import { CalendarOutlined } from '@ant-design/icons';
import { DatePicker, DatePickerProps, Form } from 'antd';
import clsx from 'clsx';
import dayjs, { Dayjs } from 'dayjs';
import { Control, Controller, FieldValues } from 'react-hook-form';

import InputErrorMessage from './InputErrorMessage';
import LabelInput from './LabelInput';

import { DEFAULT_DATE_FORMAT } from '~/utils/constants';

interface DatePickerComponentProps extends Omit<DatePickerProps, 'defaultValue'> {
  required?: boolean;
  control: Control<FieldValues, {}>;
  label?: string;
  defaultValue?: Date | Dayjs | null;
}

const DatePickerComponent = ({
  control,
  className,
  name = '',
  required,
  label = '',
  format = DEFAULT_DATE_FORMAT,
  suffixIcon = <CalendarOutlined />,
  defaultValue = null,
  ...props
}: DatePickerComponentProps) => {
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
        defaultValue={defaultValue ? (defaultValue instanceof Date ? defaultValue : defaultValue.toDate()) : null}
        render={({ field, fieldState }) => (
          <>
            <DatePicker
              {...field}
              {...props}
              value={field.value ? dayjs(field.value) : null}
              format={format}
              suffixIcon={suffixIcon}
              onChange={(_date, _stringDate) => {
                field.onChange(_stringDate);
              }}
              className={clsx('h-12 w-full rounded-2xl', className)}
            />
            <InputErrorMessage fieldState={fieldState} />
          </>
        )}
      />
    </Form.Item>
  );
};

export default DatePickerComponent;
