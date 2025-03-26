import { DeleteButton, EditButton, ShowButton, useTable } from '@refinedev/antd';
import { BaseRecord } from '@refinedev/core';
import { Space, Table } from 'antd';
import { TableProps } from 'antd/lib/table'; // Import ColumnsType
import React from 'react';

import { ColumnConfig } from '~/models/common';
import { defaultRenderValueTable } from '~/utils/common';

interface TableComponentProps extends TableProps<BaseRecord> {
  columnConfig: ColumnConfig[];
  role: keyof typeof roleActions;
}

const roleActions = {
  admin: ['edit', 'show', 'delete'],
  user: ['show'],
};

const TableComponent: React.FC<TableComponentProps> = ({ columnConfig, role, ...props }) => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });
  const data = props.dataSource;
  const allowedActions = roleActions[role] || [];

  return (
    <Table {...tableProps} {...props} rowKey="id" dataSource={data}>
      {columnConfig.map(item => {
        return (
          <Table.Column
            key={item.key}
            dataIndex={item.key}
            title={item.title}
            render={item.render ?? defaultRenderValueTable}
          />
        );
      })}
      <Table.Column
        title={'Actions'}
        dataIndex="actions"
        render={(_, record: BaseRecord) => (
          <Space>
            {allowedActions.includes('edit') && <EditButton hideText size="small" recordItemId={record.id} />}
            {allowedActions.includes('show') && <ShowButton hideText size="small" recordItemId={record.id} />}
            {allowedActions.includes('delete') && <DeleteButton hideText size="small" recordItemId={record.id} />}
          </Space>
        )}
      />
    </Table>
  );
};

export default TableComponent;
