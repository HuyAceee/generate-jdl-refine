import fs from 'fs';
import { JDL_FILE, OUTPUT_DIR, TEMPLATE_FILE } from './utils/constants';
import { applyRelationships } from './utils/relationship';
import { parseJDL, parseJDLModel } from './utils/jdl';
import { generateEnums } from './utils/enum';
import { generateModel } from './utils/model';
import { capitalizeFirstLetter, pluralize, toCamelCase, toKebabCase } from './utils/format';
import path from 'path';
import { generateFormFields, generateDefaultValues, buildColumnConfigs } from './utils/common';
import { FieldModel } from './models/common';

function generateModelFromJDL() {
  if (!fs.existsSync(JDL_FILE)) {
    console.error(`JDL file not found: ${JDL_FILE}`);
    process.exit(1);
  }

  const { entities, enums, relationships } = parseJDLModel(JDL_FILE);
  applyRelationships({ entities, relationships });
  generateEnums({ enums });

  Object.entries(entities).forEach(([entity, data]) => {
    generateModel({
      entity,
      data: data as {
        fields: FieldModel[];
        imports: string[];
      },
      enums,
    });
  });

  console.log('Models and relationships generated successfully.');
}

function generatePageFromJDL() {
  if (!fs.existsSync(TEMPLATE_FILE)) {
    console.error('❌ Not found file template.json');
    process.exit(1);
  }

  const templateData = JSON.parse(fs.readFileSync(TEMPLATE_FILE, 'utf-8')).files;

  // Get list of entities and enums from JDL
  const { entities, enums } = parseJDL(JDL_FILE);

  // Create folders and files for each entity
  entities.forEach(({ name: entity, fields }) => {
    const entityPlural = pluralize(entity);
    const entityKebab = toKebabCase(entityPlural);
    const entityCapitalized = entity.charAt(0).toUpperCase() + entity.slice(1);

    const entityDir = path.join(OUTPUT_DIR, entityKebab);
    fs.mkdirSync(entityDir, { recursive: true });

    // Generate form fields
    const formFields = generateFormFields(fields);
    const usedEnums = fields.map(f => f.type).filter(t => t?.endsWith('Enum'));
    const enumImports = usedEnums.length > 0 ? `import { ${usedEnums.join(', ')} } from '~/models/common/enum'` : '';
    const defaultValues = generateDefaultValues({ fields, enums });

    // Tạo các file từ template
    Object.entries(templateData).forEach(([fileName, content]) => {
      let newContent = (content as string)
        .replace(/{{name}}/g, entity.toLowerCase())
        .replace(/{{Name}}/g, entityCapitalized)
        .replace(/samples/g, pluralize(entityKebab))
        .replace(/sample/g, toCamelCase(entity))
        .replace(/Sample/g, entityCapitalized);

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
        <TextField value={data?.data?.${field.name}${(field?.type as string).includes('Partial') ? '?.id' : ''}} />`,
          )
          .join('\n');
        newContent = newContent.replace(
          /<Show[^>]*>[\s\S]*?<\/Show>/,
          `<Show isLoading={isLoading}>${showRows}</Show>`,
        );
      }

      fs.writeFileSync(path.join(entityDir, fileName), newContent);
    });

    console.log(`✅ Created directory ${entityDir} and files inside`);
  });
}

function main() {
  generateModelFromJDL();
  generatePageFromJDL();
}

main();
