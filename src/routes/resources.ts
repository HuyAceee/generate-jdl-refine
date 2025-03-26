import { ResourceProps } from '@refinedev/core';

const resourcesCategories = ['sample'];

export const resources: ResourceProps[] | undefined = resourcesCategories.map(name => ({
  name,
  list: `/${name}`,
  create: `/${name}/create`,
  edit: `/${name}/edit/:id`,
  show: `/${name}/show/:id`,
  meta: {
    canDelete: true,
  },
}));
