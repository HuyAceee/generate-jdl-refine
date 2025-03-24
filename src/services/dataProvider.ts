import { DataProvider, GetOneParams } from '@refinedev/core';
import axios from 'axios';

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination }) => {
    const { current = 1, pageSize = 10 } = pagination ?? {};

    const queryParams = new URLSearchParams({
      page: (current - 1).toString(),
      size: pageSize.toString(),
    });

    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/${resource}?${queryParams}`);

    return {
      data: response.data.data,
      total: response.data.total,
    };
  },

  getOne: async <T>({ resource, id }: GetOneParams): Promise<{ data: T }> => {
    const response = await axios.get<T>(`${import.meta.env.VITE_BASE_URL}/${resource}/${id}`);
    return { data: response.data };
  },

  create: async ({ resource, variables }) => {
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/${resource}`, variables);
    return { data: response.data };
  },

  update: async ({ resource, id, variables }) => {
    const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/${resource}/${id}`, variables);
    return { data: response.data };
  },

  deleteOne: async ({ resource, id }) => {
    return await axios.delete(`${import.meta.env.VITE_BASE_URL}/${resource}/${id}`);
  },
  getApiUrl: () => import.meta.env.VITE_BASE_URL,
};
