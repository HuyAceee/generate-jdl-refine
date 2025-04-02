import path from 'path';
import { pluralize, toCamelCase, toKebabCase } from './format';
import fs from 'fs';
import { COMMON_IMPORT, ENTITY_MODEL_DIR, VALIDATION_UTILS } from './constants';
import { FieldModel } from '../models/common';

interface GenerateModelInput {
  entity: string;
  data: {
    fields: FieldModel[];
    imports: string[];
  };
  enums: Record<string, string[]>;
}

export function generateModel({ entity, data: { fields, imports }, enums }: GenerateModelInput) {
  const entityFolder = toKebabCase(pluralize(entity));
  const entityDir = path.join(ENTITY_MODEL_DIR, entityFolder);
  fs.mkdirSync(entityDir, { recursive: true });
  const modelPath = path.join(entityDir, 'index.ts');

  const hasEnum = fields.some(f => enums.hasOwnProperty(f?.type as string));
  const enumsString = fields
    .filter(f => enums.hasOwnProperty(f?.type as string))
    ?.map(c => c.tsType)
    ?.join(', ');

  const importEnums = hasEnum ? `import { ${enumsString} } from '~/models/common/enum';\n` : '';
  const fieldsContent = fields.map(f => `  ${f.name}${f.required ? '' : '?'}: ${f.tsType};`).join('\n');
  const importsRelations = imports.join('\n').replace(/\[|\]/g, '');

  const schemaContent = fields
    .map(f => {
      if (f?.tsType?.includes('Partial')) {
        if (f?.tsType?.includes('[]')) {
          return `  ${f.name}: schemaUtils.array.default(),`;
        }
        return `  ${f.name}: z.object({\n    id: schemaUtils.required(),\n  }),`;
      } else {
        return `  ${f.name}: schemaUtils.${enums.hasOwnProperty(f?.type as string) ? `enum(${f.tsType})` : f.tsType === 'number' ? 'number' : 'string'}${f.validation ? f.validation : ''}${f.required ? (f.validation ? '' : '.required()') : '.optional()'},`;
      }
    })
    .join('\n');

  const content =
    `${importEnums}${COMMON_IMPORT}` +
    importsRelations +
    `\nimport { z } from 'zod';\nimport { schemaUtils } from '${VALIDATION_UTILS}';\n\nexport const ${toCamelCase(entity)}Schema = z.object({\n${schemaContent}\n});\n\nexport interface ${entity}Model extends BaseRecordModel {\n${fieldsContent}\n}\n\nexport type Partial${entity}Model = PartialExceptOne<${entity}Model, 'id'>;\n`;

  fs.writeFileSync(modelPath, content);
}
