export interface SelectOptionModel {
  name: string;
  id: number | string;
}

export interface ColumnConfig {
  key: string;
  title: string;
  render?: (value: any) => JSX.Element | string;
}

export type PartialExceptOne<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

export interface BaseRecordModel {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
