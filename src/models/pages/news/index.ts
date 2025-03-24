import { PartialExceptOne } from '~/models/common';

export interface NewModel {
  id: string;
  name: string;
  description: string;
}

export type PartialNewModel = PartialExceptOne<NewModel, 'id'>;
