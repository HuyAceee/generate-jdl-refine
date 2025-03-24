import { List } from '@refinedev/antd';

import TableComponent from '~/components/common/TableComponent';
import { ColumnConfig } from '~/models/common';
import { NewModel } from '~/models/pages/news';

const columnConfigs: ColumnConfig[] = [
  {
    key: 'id',
    title: 'ID',
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
    render: (record: NewModel) => {
      return record.name;
    },
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
