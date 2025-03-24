import { DateField, MarkdownField, Show, TextField } from '@refinedev/antd';
import { useOne } from '@refinedev/core';
import { Typography } from 'antd';

import { SampleModel } from '~/models/pages/sample';

const { Title } = Typography;

export const SampleShow = () => {
  const { data, isLoading } = useOne<SampleModel>({ resource: 'sample' });
  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{'ID'}</Title>
      <TextField value={data?.data?.id} />
      <Title level={5}>{'Title'}</Title>
      <TextField value={data?.data?.title} />
      <Title level={5}>{'Content'}</Title>
      <MarkdownField value={data?.data?.content} />
      <Title level={5}>{'Description'}</Title>
      <MarkdownField value={data?.data?.description} />
      <Title level={5}>{'New'}</Title>
      <TextField value={data?.data?.new?.name} />
      <Title level={5}>{'Status'}</Title>
      <TextField value={data?.data?.status} />
      <Title level={5}>{'CreatedAt'}</Title>
      <DateField value={data?.data?.createdAt} />
    </Show>
  );
};
