import { CalendarOutlined } from '@ant-design/icons';
import { DatePicker, Form } from 'antd';
import { RangePickerProps } from 'antd/lib/date-picker';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { Control, Controller, FieldValues } from 'react-hook-form';

import InputErrorMessage from './InputErrorMessage';
import LabelInput from './LabelInput';

import { DEFAULT_DATE_FORMAT } from '~/utils/constants';

type EventValue<DateType> = DateType | null;
type RangeValueType<DateType> = [EventValue<DateType>, EventValue<DateType>] | null;
const { RangePicker } = DatePicker;

interface DateRangePickerComponentProps extends Omit<RangePickerProps, 'defaultValue'> {
  label?: string;
  control: Control<FieldValues, {}>;
  defaultValue?: [Date, Date] | RangeValueType<dayjs.Dayjs> | null;
  required?: boolean;
}

const DateRangePickerComponent = ({
  control,
  className,
  name = '',
  label = '',
  required,
  format = DEFAULT_DATE_FORMAT,
  suffixIcon = <CalendarOutlined />,
  defaultValue = null,
  ...props
}: DateRangePickerComponentProps) => (
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
      defaultValue={defaultValue ? defaultValue.map(d => (d instanceof Date ? dayjs(d) : d)) : null}
      render={({ field, fieldState }) => (
        <>
          <RangePicker
            {...props}
            {...field}
            value={field.value ? [dayjs(field.value[0]), dayjs(field.value[1])] : null}
            format={format}
            suffixIcon={suffixIcon}
            className={clsx('h-12 rounded-2xl border shadow-sm', className)}
            onChange={(dates, _stringDate) => {
              field.onChange(dates ? dates.map(d => d?.toDate() ?? null) : null);
            }}
          />
          <InputErrorMessage fieldState={fieldState} />
        </>
      )}
    />
  </Form.Item>
);

export default DateRangePickerComponent;
