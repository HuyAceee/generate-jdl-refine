import { z } from 'zod';

import { NewModel, PartialNewModel } from '../news';

import { BaseRecordModel, PartialExceptOne } from '~/models/common';
import { StatusEnum } from '~/models/common/enum';
import { schemaUtils } from '~/utils/validation';

export const sampleSchema = z.object({
  title: schemaUtils.string.min(3),
  content: schemaUtils.string.min(10),
  description: schemaUtils.string.min(10),
  new: z.object({
    id: schemaUtils.required(),
  }),
  status: schemaUtils.enum(StatusEnum),
  email: schemaUtils.string.email(),
  price: schemaUtils.number.default(),
  dealine: schemaUtils.string.default(),
  tags: schemaUtils.array.min(1),
});

export interface SampleModel extends BaseRecordModel {
  title: string;
  content: string;
  new: PartialNewModel;
  description: string;
  status: StatusEnum;
  email?: string;
  price?: number;
  deadline?: string;
  tags?: string[];
}

export type PartialSampleModel = PartialExceptOne<NewModel, 'id'>;
