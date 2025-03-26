import { MarkdownField } from '@refinedev/antd';

import { SelectOptionModel } from '~/models/common';

export const defaultRenderValueTable = (value: string) => {
  if (!value) {
    return '-';
  }
  return <MarkdownField value={value.slice(0, 80) + '...'} />;
};

export const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const enumToOptions = <T extends Record<string, string>>(enumObj: T): SelectOptionModel[] => {
  return Object.values(enumObj).map(value => ({
    id: value,
    name: value.charAt(0).toUpperCase() + value.slice(1),
  }));
};
