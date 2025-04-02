import fs from 'fs';
import { COMMON_MODEL_DIR, ENUM_FILE } from './constants';
import { FieldModel } from '../models/common';

interface GenerateEnumsInputModel {
  enums: Record<string, string[]>;
}

export function generateEnums({ enums }: GenerateEnumsInputModel) {
  fs.mkdirSync(COMMON_MODEL_DIR, { recursive: true });
  let content = '';
  Object.entries(enums).forEach(([enumName, values]) => {
    content += `export enum ${enumName}Enum {\n`;
    values.forEach(value => {
      content += `  ${value} = '${value}',\n`;
    });
    content += `}\n\n`;
  });
  fs.writeFileSync(ENUM_FILE, content);
}

export function generateEnumImports(fields: FieldModel[]) {
  const usedEnums = fields.map(f => f.type).filter(t => t?.endsWith('Enum'));
  return usedEnums.length > 0 ? `import { ${usedEnums.join(', ')} } from '~/models/common/enum'` : '';
}
