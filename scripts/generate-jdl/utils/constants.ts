import path from 'path';

export const JDL_FILE = process.argv[2];

export const MODEL_DIR = path.join(__dirname, '../src', 'models');
export const COMMON_MODEL_DIR = path.join(MODEL_DIR, 'common');
export const ENTITY_MODEL_DIR = path.join(MODEL_DIR, 'pages');
export const ENUM_FILE = path.join(COMMON_MODEL_DIR, 'enum.ts');
export const VALIDATION_UTILS = '~/utils/validation';
export const COMMON_IMPORT = "import { BaseRecordModel, PartialExceptOne } from '~/models/common';\n";

export const TEMPLATE_FILE = path.join(__dirname, 'template.json');
export const OUTPUT_DIR = path.join(__dirname, '../src', 'pages');
