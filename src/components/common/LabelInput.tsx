import { Typography } from 'antd';
import { ReactNode } from 'react';

import { capitalizeFirstLetter } from '~/utils/common';

const { Title } = Typography;

interface LabelInputModel {
  label?: ReactNode;
  required?: boolean;
}

const LabelInput = ({ label, required }: LabelInputModel) => {
  return (
    <Title level={5}>
      {typeof label === 'string' ? capitalizeFirstLetter(label ?? '') : label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </Title>
  );
};

export default LabelInput;
