import { FieldModel } from '../models/common';
import { capitalizeFirstLetter, pluralize, toCamelCase, toKebabCase } from './format';

interface GenerateDefaultValuesInputModel {
  fields: FieldModel[];
  enums: Record<string, string[]>;
}

export function generateDefaultValues({ fields, enums }: GenerateDefaultValuesInputModel) {
  return `{\n${fields.map(({ name, type }) => `${name}: ${getDefaultValue(type as string, enums)},`).join('\n')}\n}`;
}

export function getDefaultValue(type: string, enums: Record<string, string[]>): string {
  const keys = Object.keys(enums);
  const enumKeys = keys.map(key => key + 'Enum');
  const defaultValues = {
    string: "''",
    number: '0',
    boolean: 'false',
    'string[]': '[]',
    'number[]': '[]',
    'boolean[]': '[]',
    Date: 'new Date()',
  };
  const indexEnum = enumKeys.findIndex(e => e === type);
  if (indexEnum > -1) return `${enumKeys[indexEnum]}.${enums[keys[indexEnum]]?.[0]}`;
  if (type.includes('[]')) return '[]';
  if (type.includes('Partial')) return '{ id: null }';
  return defaultValues[type as keyof typeof defaultValues] || 'null';
}

export function buildColumnConfigs(fields: FieldModel[]) {
  const fieldsArr = fields.map(field => {
    return {
      key: field.name,
      title: capitalizeFirstLetter(field.name),
    };
  });
  return JSON.stringify(fieldsArr, null, 2);
}

export function generateFormFields(fields: FieldModel[]) {
  return fields
    .map(({ name, type }) => {
      if (type === 'string') {
        if (name.toLowerCase().includes('content')) {
          return `<TextEditorComponent control={control} name="${name}" />`;
        }
        if (name.toLowerCase().includes('description')) {
          return `<TextAreaComponent control={control} name="${name}" />`;
        }
        if (
          name.toLowerCase().includes('date') ||
          name.toLowerCase().includes('time') ||
          name.toLowerCase().includes('createdat') ||
          name.toLowerCase().includes('updatedat')
        ) {
          return `<DatePickerComponent control={control} name="${name}" />`;
        }
        return `<InputComponent control={control} name="${name}" />`;
      }

      if (type === 'number') {
        return `<InputNumberComponent control={control} name="${name}" />`;
      }

      if (type?.endsWith('Enum')) {
        return `<SelectComponent control={control} options={enumToOptions(${type})} name="${name}" />`;
      }

      if (type?.startsWith('Partial')) {
        return `<SelectComponent control={control} resource="${name}" name="${name}" />`;
      }

      return `<InputComponent control={control} name="${name}" />`;
    })
    .filter(Boolean)
    .join('\n        ');
}

interface GenerateContentInputModel {
  fileName: string;
  content: string;
  entity: string;
  defaultValues: string;
  formFields: string;
  fields: FieldModel[];
}

export function generateContent({ fileName, content, entity, defaultValues, fields }: GenerateContentInputModel) {
  const entityPlural = pluralize(entity);
  const entityKebab = toKebabCase(entityPlural);
  const formFields = generateFormFields(fields);
  const usedEnums = fields.map(f => f.type).filter(t => t?.endsWith('Enum'));
  const enumImports = usedEnums.length > 0 ? `import { ${usedEnums.join(', ')} } from '~/models/common/enum'` : '';
  let newContent = content
    .replace(/{{name}}/g, entity.toLowerCase())
    .replace(/{{Name}}/g, capitalizeFirstLetter(entity))
    .replace(/samples/g, pluralize(entityKebab))
    .replace(/sample/g, toCamelCase(entity))
    .replace(/Sample/g, capitalizeFirstLetter(entity));

  newContent = newContent.replace(`~/models/pages/${toCamelCase(entity)}`, `~/models/pages/${entityKebab}`);

  // Insert form fields into create.tsx and edit.tsx
  if (fileName === 'create.tsx' || fileName === 'edit.tsx') {
    newContent = newContent.replace(
      /const \{ control, formProps, saveButtonProps \} = useRefineForm\(.*?\);/s,
      `const { control, formProps, saveButtonProps } = useRefineForm(${toCamelCase(entity)}Schema,${fileName === 'edit.tsx' ? ' (data as unknown) ??' : ''} ${defaultValues});`,
    );
    newContent = newContent.replace(
      /<Form[\s\S]*?>[\s\S]*?<\/Form>/g,
      `<Form {...formProps} layout="vertical">\n        ${formFields}\n      </Form>`,
    );
    if (enumImports) {
      newContent = enumImports + '\n' + newContent;
    }
  } else if (fileName === 'list.tsx') {
    const columnConfigs = buildColumnConfigs(fields);
    newContent = newContent.replace(
      /const columnConfigs: ColumnConfig\[\] = \[([\s\S]*?)\];/,
      `const columnConfigs: ColumnConfig[] = ${columnConfigs};`,
    );
  } else if (fileName === 'show.tsx') {
    const showRows = fields
      .map(
        field => `<Title level={5}>{'${capitalizeFirstLetter(field.name)}'}</Title>
      <TextField value={data?.data?.${field.name}${field.type?.includes('Partial') ? '?.id' : ''}} />`,
      )
      .join('\n');
    newContent = newContent.replace(/<Show[^>]*>[\s\S]*?<\/Show>/, `<Show isLoading={isLoading}>${showRows}</Show>`);
  }
}
