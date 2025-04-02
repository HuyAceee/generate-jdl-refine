import { MarkdownField } from '@refinedev/antd';

import { SelectOptionModel } from '~/models/common';

export const defaultRenderValueTable = (value: [{ name: string }] | { name: string } | string | number) => {
  if (typeof value === 'string' || typeof value === 'number') {
    if (!value) {
      return '-';
    }
    return <MarkdownField value={value.toString().slice(0, 80) + '...'} />;
  } else if (value instanceof Array) {
    const mappingValue = value.map(value => value.name).join(', ');
    return <MarkdownField value={mappingValue.slice(0, 80) + '...'} />;
  } else {
    return <MarkdownField value={value.name.slice(0, 80) + '...'} />;
  }
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
