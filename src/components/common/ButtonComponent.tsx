import { CloseSquareOutlined } from '@ant-design/icons';
import { CheckOutlined } from '@ant-design/icons';
import { ReloadOutlined } from '@ant-design/icons';
import { SearchOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { ButtonProps } from 'antd/es/button';
import clsx from 'clsx';
import React from 'react';

interface ButtonComponentProps extends ButtonProps {
  label?: string;
  typeButton: 'cancel' | 'draft' | 'refresh' | 'search';
}

const getButtonStyles = (typeButton: ButtonComponentProps['typeButton']) => {
  switch (typeButton) {
    case 'cancel':
      return {
        icon: <CloseSquareOutlined />,
        className: 'bg-[#1D2939]',
        label: 'Hủy',
      };
    case 'draft':
      return {
        icon: <CheckOutlined />,
        className: 'bg-[#FBD200]',
        label: 'Lưu nháp',
      };
    case 'refresh':
      return {
        icon: <ReloadOutlined />,
        className: 'bg-[#31B44A]',
        label: 'Làm mới',
      };
    case 'search':
      return {
        icon: <SearchOutlined className="text-black" />,
        className: 'bg-white',
        label: 'Tìm kiếm',
      };
  }
};

export const ButtonComponent: React.FC<ButtonComponentProps> = ({ typeButton, className, icon, label, ...rest }) => {
  const { icon: defaultIcon, className: defaultClassName, label: defaultText } = getButtonStyles(typeButton);

  const combinedClassName = clsx('h-10 rounded-xl', defaultClassName, className, {
    'text-white': typeButton !== 'search',
    'text-[#ccc]': typeButton === 'search',
  });
  return (
    <Button className={combinedClassName} icon={icon ?? defaultIcon} {...rest}>
      {label ?? defaultText}
    </Button>
  );
};
