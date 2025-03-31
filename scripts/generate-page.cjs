const fs = require('fs')
const path = require('path')

const JDL_FILE = process.argv[2] // Nhận file JDL từ tham số dòng lệnh
const TEMPLATE_FILE = path.join(__dirname, 'template.json')
const OUTPUT_DIR = path.join(__dirname, '../src', 'pages')

// Kiểm tra nếu không có file JDL được truyền vào
if (!JDL_FILE) {
  console.error('❌ Vui lòng cung cấp file JDL. Ví dụ: node scripts/generate-page.cjs jhipster-jdl.jdl')
  process.exit(1)
}

function toCamelCase(str) {
  return str
    .toLowerCase()
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (match, index) =>
      index === 0 ? match.toLowerCase() : match.toUpperCase()
    )
    .replace(/\s+|[_-]/g, '');
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Chuyển kiểu JDL sang TypeScript (fix lỗi enum bị any)
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

// Mapping kiểu dữ liệu sang giá trị mặc định
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


// Đọc file JDL để lấy danh sách entity và enum
function parseJDL(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Không tìm thấy file JDL: ${filePath}`)
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

    // Tìm phần nội dung trong {}
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

    // Lấy toàn bộ nội dung bên trong { }
    const relationshipBody = content.slice(startIndex, endIndex - 1).trim();

    // Chia nhỏ từng quan hệ bên trong { }
    const relations = relationshipBody
      .split('\n')
      .map(line => line.trim())
      .filter(line => line);

    // Thêm từng quan hệ vào danh sách
    relations.forEach(relationshipBody => {
      const sourceMatch = relationshipBody.match(/^(\w+)\{([^}]+)\}/);

      const targetMatch = relationshipBody.match(/to\s+(\w+)\{(\w+)}$/);
      if (!sourceMatch || !targetMatch) {
        console.error(`Invalid relationship format}`);
        return;
      }

      const [_, sourceEntity, _sourceField] = sourceMatch;
      const [__, targetEntity, _targetField] = targetMatch;
      const sourceField = _sourceField.match(/^(\w+)\(/)?.[1] || _sourceField
      const targetField = _targetField.match(/^(\w+)\(/)?.[1] || _targetField
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
    console.error('❌ Không tìm thấy entity nào trong file JDL.')
    process.exit(1)
  }

  return { entities, enums }
}

// Chuyển entity sang plural-form
function pluralize(word) {
  if (word.endsWith('y')) return word.slice(0, -1) + 'ies'
  if (word.endsWith('s')) return word + 'es'
  return word + 's'
}

// Chuyển PascalCase hoặc camelCase thành kebab-case
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
  console.error('❌ Không tìm thấy file template.json')
  process.exit(1)
}

const templateData = JSON.parse(fs.readFileSync(TEMPLATE_FILE, 'utf-8')).files

// Lấy danh sách entity và enum từ JDL
const { entities, enums } = parseJDL(JDL_FILE)

// Tạo thư mục và file cho từng entity
entities.forEach(({ name: entity, fields }) => {
  const entityPlural = pluralize(entity)
  console.log(entityPlural);

  const entityKebab = toKebabCase(entityPlural)
  console.log(entityKebab)
  const entityCapitalized = entity.charAt(0).toUpperCase() + entity.slice(1)

  const entityDir = path.join(OUTPUT_DIR, entityKebab)
  fs.mkdirSync(entityDir, { recursive: true })

  // Generate form fields
  const formFields = generateFormFields(fields)
  const usedEnums = fields.map(f => f.type).filter(t => t.endsWith('Enum'))
  let enumImports = usedEnums.length > 0 ? `import { ${usedEnums.join(', ')} } from '~/models/common/enum'` : ''
  const defaultValues = generateDefaultValues(fields, enums)

  // Tạo các file từ template
  Object.entries(templateData).forEach(([fileName, content]) => {
    let newContent = content
      .replace(/{{name}}/g, entity.toLowerCase())
      .replace(/{{Name}}/g, entityCapitalized)
      .replace(/samples/g, entityKebab)
      .replace(/sample/g, entity.toLowerCase())
      .replace(/Sample/g, entityCapitalized)

    // Chèn form fields vào create.tsx và edit.tsx
    if (fileName === 'create.tsx' || fileName === 'edit.tsx') {
      newContent = newContent.replace(
        /const \{ control, formProps, saveButtonProps \} = useRefineForm\(.*?\);/s,
        `const { control, formProps, saveButtonProps } = useRefineForm(${toCamelCase(entity)}Schema,${fileName === 'edit.tsx' ? ' (data as unknown) ??' : ''} ${defaultValues});`
      )
      newContent = newContent.replace(
        /<Form[\s\S]*?>[\s\S]*?<\/Form>/g,
        `<Form {...formProps} layout="vertical">\n        ${formFields}\n      </Form>`
      )
      if (enumImports) {
        newContent = enumImports + '\n' + newContent
      }
    } else if (fileName === 'list.tsx') {
      const columnConfigs = buildColumnConfigs(fields)
      newContent = newContent.replace(
        /const columnConfigs: ColumnConfig\[\] = \[([\s\S]*?)\];/,
        `const columnConfigs: ColumnConfig[] = ${columnConfigs};`
      )
    } else if (fileName === 'show.tsx') {
      const showRows = fields.map((field) => `<Title level={5}>{'${capitalizeFirstLetter(field.name)}'}</Title>
      <TextField value={data?.data?.${field.name}} />`).join("\n")
      newContent = newContent.replace(
        /<Show[^>]*>[\s\S]*?<\/Show>/,
        `<Show isLoading={isLoading}>${showRows}</Show>`
      )
    }

    fs.writeFileSync(path.join(entityDir, fileName), newContent)
  })

  console.log(`✅ Đã tạo thư mục ${entityDir} và các file bên trong`)
})

console.log('🎉 Hoàn thành!')
