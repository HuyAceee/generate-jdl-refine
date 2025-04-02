const fs = require('fs')
const path = require('path')

const JDL_FILE = process.argv[2] // Get JDL file from command line parameter
const TEMPLATE_FILE = path.join(__dirname, 'template.json')
const OUTPUT_DIR = path.join(__dirname, '../src', 'pages')

// Check if no JDL file is passed
if (!JDL_FILE) {
  console.error('❌ Please provide the JDL file. Example: node scripts/generate-page.cjs jhipster-jdl.jdl');
  process.exit(1)
}

function toCamelCase(str) {
  return str
    .replace(/_./g, match => match.charAt(1).toUpperCase())
    .replace(/-/g, '')
    .replace(/^./, match => match.toLowerCase());
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Convert JDL type to TypeScript (fix enum error with any)
function mapJDLTypeToTS(jdlType, enums) {
  return enums.hasOwnProperty(jdlType)
    ? `${jdlType}Enum`
    : {
        String: 'string',
        Integer: 'number',
        Long: 'number',
        BigDecimal: 'number',
        Boolean: 'boolean',
        LocalDate: 'string',
        ZonedDateTime: 'string',
        Instant: 'string',
        UUID: 'string',
      }[jdlType] || 'any'
}

// Tạo defaultValues từ entity
function generateDefaultValues(fields, enums) {
  return `{\n${fields
    .map(({ name, type }) => `${name}: ${getDefaultValue(type, enums)},`)
    .join('\n')}\n}`
}

// Mapping data type to default value
function getDefaultValue(type) {
  const keys = Object.keys(enums);
  const enumKeys = keys.map(key => key + 'Enum');
  const defaultValues = {
    string: "''",
    number: "0",
    boolean: "false",
    "string[]": "[]",
    "number[]": "[]",
    "boolean[]": "[]",
    Date: "new Date()",
  }
  const indexEnum = enumKeys.findIndex((e) => e === type)
  if (indexEnum > -1) return `${enumKeys[indexEnum]}.${enums[keys[indexEnum]]?.[0]}`
  if (type.includes("[]")) return '[]'
  if (type.includes("Partial")) return '{ id: null }'
  return defaultValues[type] || "null"
}


function parseJDL(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Cannot find file JDL: ${filePath}`)
    process.exit(1)
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const entityRegex = /entity\s+(\w+)\s*\{([^}]*)\}/g
  const enumRegex = /enum\s+(\w+)\s*\{([^}]*)\}/g
  const relationRegex = /relationship\s+(OneToOne|OneToMany|ManyToOne|ManyToMany)\s*\{/g;
  let match
  const entities = []
  const enums = {}
  const relationships = [];

  // Parse enums
  while ((match = enumRegex.exec(content)) !== null) {
    enums[match[1]] = match[2]
      .trim()
      .split(',')
      .map(value => value.trim())
  }

  while ((match = relationRegex.exec(content)) !== null) {
    const relationType = match[1];
    const startIndex = match.index + match[0].length;

    // Find the content in {}
    let balance = 1;
    let endIndex = startIndex;

    while (endIndex < content.length && balance > 0) {
      if (content[endIndex] === '{') {
        balance++;
      } else if (content[endIndex] === '}') {
        balance--;
      }
      endIndex++;
    }

    // Get all the content inside { }
    const relationshipBody = content.slice(startIndex, endIndex - 1).trim();

    // Split each relationship inside { }
    const relations = relationshipBody
      .split('\n')
      .map(line => line.trim())
      .filter(line => line);

    // Add each relation to the list
    relations.forEach(relationshipBody => {
      const sourceMatch = relationshipBody.match(/^(\w+)\{([^}]+)\}/);

      const targetMatch = relationshipBody.match(/to\s+(\w+)\{(\w+)}$/);
      if (!sourceMatch || !targetMatch) {
        console.error(`Invalid relationship format}`);
        return;
      }

      const [_, sourceEntity, _sourceField] = sourceMatch;
      const [__, targetEntity, _targetField] = targetMatch;
      const sourceField = _sourceField.match(/^(\w+)\(/)?.[1] || _sourceField;
      const targetField = _targetField.match(/^(\w+)\(/)?.[1] || _targetField;
      relationships.push({ type: relationType, sourceEntity, sourceField, targetEntity, targetField });
    });
  }

  // Parse entities
  while ((match = entityRegex.exec(content)) !== null) {
    const entityName = match[1]
    let fields = match[2]
      .trim()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('//'))
      .map(line => {
        const parts = line.split(/\s+/)
        return { name: parts[0], type: mapJDLTypeToTS(parts[1], enums) }
      })
    relationships.forEach((relationship) => {
      if (relationship.sourceEntity === entityName) {
        fields.push({ name: relationship.sourceField, type: `Partial${relationship.targetEntity}Model${relationship.type === 'OneToMany' || relationship.type === 'ManyToMany' ? '[]' : ''}` })
      } else if (relationship.targetEntity === entityName) {
        fields.push({ name: relationship.targetField, type: `Partial${relationship.sourceEntity}Model${relationship.type === 'ManyToOne' || relationship.type === 'ManyToMany' ? '[]' : ''}` })
      }
    })

    entities.push({ name: entityName, fields })
  }

  if (entities.length === 0) {
    console.error('❌ No entity found in JDL file.');
    process.exit(1)
  }

  return { entities, enums }
}

// Convert entity to plural-form
function pluralize(word) {
  if (word.endsWith('y')) return word.slice(0, -1) + 'ies'
  if (word.endsWith('s')) return word + 'es'
  return word + 's'
}

// Convert PascalCase or camelCase to kebab-case
function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

function buildColumnConfigs(fields) {
  const fieldsArr =  fields
    .map((field) => {
      return {
        key: field.name,
        title: capitalizeFirstLetter(field.name),
      }
    })
    return JSON.stringify(fieldsArr, null, 2)
}

// Tạo component field phù hợp với type và tên field
function generateFormFields(fields) {
  return fields
    .map(({ name, type }) => {
      if (type === 'string') {
        if (name.toLowerCase().includes('content')) {
          return `<TextEditorComponent control={control} name="${name}" />`
        }
        if (name.toLowerCase().includes('description')) {
          return `<TextAreaComponent control={control} name="${name}" />`
        }
        if (
          name.toLowerCase().includes('date') ||
          name.toLowerCase().includes('time') ||
          name.toLowerCase().includes('createdat') ||
          name.toLowerCase().includes('updatedat')
        ) {
          return `<DatePickerComponent control={control} name="${name}" />`
        }
        return `<InputComponent control={control} name="${name}" />`
      }

      if (type === 'number') {
        return `<InputNumberComponent control={control} name="${name}" />`
      }

      if (type.endsWith('Enum')) {
        return `<SelectComponent control={control} options={enumToOptions(${type})} name="${name}" />`
      }

      if (type.startsWith('Partial')) {
        return `<SelectComponent control={control} resource="${name}" name="${name}" />`
      }

      return `<InputComponent control={control} name="${name}" />`
    })
    .filter(Boolean)
    .join('\n        ')
}

// Đọc template từ file JSON
if (!fs.existsSync(TEMPLATE_FILE)) {
  console.error('❌ Not found file template.json');
  process.exit(1)
}

const templateData = JSON.parse(fs.readFileSync(TEMPLATE_FILE, 'utf-8')).files

// Get list of entities and enums from JDL
const { entities, enums } = parseJDL(JDL_FILE)

// Create folders and files for each entity
entities.forEach(({ name: entity, fields }) => {
  const entityPlural = pluralize(entity)
  const entityKebab = toKebabCase(entityPlural)
  const entityCapitalized = entity.charAt(0).toUpperCase() + entity.slice(1)

  const entityDir = path.join(OUTPUT_DIR, entityKebab)
  fs.mkdirSync(entityDir, { recursive: true })

  // Generate form fields
  const formFields = generateFormFields(fields)
  const usedEnums = fields.map(f => f.type).filter(t => t.endsWith('Enum'))
  const enumImports = usedEnums.length > 0 ? `import { ${usedEnums.join(', ')} } from '~/models/common/enum'` : ''
  const defaultValues = generateDefaultValues(fields, enums)

  // Tạo các file từ template
  Object.entries(templateData).forEach(([fileName, content]) => {
    let newContent = content
      .replace(/{{name}}/g, entity.toLowerCase())
      .replace(/{{Name}}/g, entityCapitalized)
      .replace(/samples/g, pluralize(entityKebab))
      .replace(/sample/g, toCamelCase(entity))
      .replace(/Sample/g, entityCapitalized);

    newContent = newContent.replace(`~/models/pages/${toCamelCase(entity)}`, `~/models/pages/${entityKebab}`)

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
      <TextField value={data?.data?.${field.name}${field.type.includes('Partial') ? '?.id' : ''}} />`,
        )
        .join('\n');
      newContent = newContent.replace(/<Show[^>]*>[\s\S]*?<\/Show>/, `<Show isLoading={isLoading}>${showRows}</Show>`);
    }

    fs.writeFileSync(path.join(entityDir, fileName), newContent);
  })

  console.log(`✅ Created directory ${entityDir} and files inside`);
})

console.log('🎉 Completed!');
