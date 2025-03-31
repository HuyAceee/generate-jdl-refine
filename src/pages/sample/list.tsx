import { List } from '@refinedev/antd';

import TableComponent from '~/components/common/TableComponent';
import { ColumnConfig } from '~/models/common';

const columnConfigs: ColumnConfig[] = [
  {
    key: 'id',
    title: 'Id',
  },
  {
    key: 'title',
    title: 'Title',
  },
  {
    key: 'content',
    title: 'Content',
  },
  {
    key: 'description',
    title: 'Description',
  },
  {
    key: 'new',
    title: 'New',
  },
  {
    key: 'status',
    title: 'Status',
  },
];

export const SampleList = () => {
  return (
    <List>
      <TableComponent columnConfig={columnConfigs} role="admin" />
    </List>
  );
};
