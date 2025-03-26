const fs = require('fs');
const path = require('path');

const JDL_FILE = process.argv[2];
const MODEL_DIR = path.join(__dirname, '../src', 'models');
const COMMON_MODEL_DIR = path.join(MODEL_DIR, 'common');
const ENTITY_MODEL_DIR = path.join(MODEL_DIR, 'pages');
const ENUM_FILE = path.join(COMMON_MODEL_DIR, 'enum.ts');
const VALIDATION_UTILS = '~/utils/validation';
const COMMON_IMPORT = "import { BaseRecordModel, PartialExceptOne } from '~/models/common';\n";

function toCamelCase(str) {
  return str
    .toLowerCase()
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (match, index) =>
      index === 0 ? match.toLowerCase() : match.toUpperCase()
    )
    .replace(/\s+|[_-]/g, '');
}

const capitalizeFirstLetter = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Chuyển entity thành kebab-case
function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

// Tạo validation schema từ constraints
function generateValidation(name, type, constraints) {
  const validation = [];
  if (name.toLowerCase().includes('email')) {
    validation.push('.email()');
  }
  if (name.toLowerCase().includes('phone')) {
    validation.push('.phone()');
  }
  if (name.toLowerCase().includes('url')) {
    validation.push('.url()');
  }

  constraints.forEach(constraint => {
    if (constraint.startsWith('min')) {
      const value = constraint.match(/\d+/)[0];
      validation.push(`.min(${value})`);
    }
    if (constraint.startsWith('max')) {
      const value = constraint.match(/\d+/)[0];
      validation.push(`.max(${value})`);
    }
  });
  return validation.length > 0 ? validation.join('') : '';
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
      }[jdlType] || 'any';
}

// Parse file JDL
function parseJDL(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const entityRegex = /entity\s+(\w+)\s*\{([^}]*)\}/g;
  const enumRegex = /enum\s+(\w+)\s*\{([^}]*)\}/g;
  const relationRegex = /relationship\s+(OneToOne|OneToMany|ManyToOne|ManyToMany)\s*\{/g;
  let match;
  const entities = {};
  const enums = {};
  const relationships = [];

  while ((match = enumRegex.exec(content)) !== null) {
    enums[match[1]] = match[2]
      .trim()
      .split(',')
      .map(value => value.trim());
  }

  while ((match = entityRegex.exec(content)) !== null) {
    const entityName = match[1];
    const fields = match[2]
      .trim()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('//'))
      .map(line => {
        const parts = line.split(/\s+/);
        const name = parts[0];
        const type = parts[1];
        const constraints = parts.slice(2);
        const required = constraints.includes('required');
        const validation = generateValidation(name, type, constraints);
        return { name, type, tsType: mapJDLTypeToTS(type, enums), required, validation };
      });
    entities[entityName] = { fields, imports: [] };
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

      const [_, sourceEntity, sourceField] = sourceMatch;
      const [__, targetEntity, targetField] = targetMatch;
      relationships.push({ type: relationType, sourceEntity, sourceField, targetEntity, targetField });
    });
  }

  return { entities, enums, relationships };
}

// Tạo file enum.ts
function generateEnums(enums) {
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

// Tạo model interface và schema validation
function generateModel(entity, { fields, imports }, enums) {
  const entityFolder = toKebabCase(entity);
  const entityDir = path.join(ENTITY_MODEL_DIR, entityFolder);
  fs.mkdirSync(entityDir, { recursive: true });
  const modelPath = path.join(entityDir, 'index.ts');

  const hasEnum = fields.some(f => enums.hasOwnProperty(f.type));
  const enumsString = fields.filter(f => enums.hasOwnProperty(f.type))?.map((c) => c.tsType)?.join(', ');

  const importEnums = hasEnum ? `import { ${enumsString} } from '~/models/common/enum';\n` : '';
  const fieldsContent = fields.map(f => `  ${f.name}${f.required ? '' : '?'}: ${f.tsType};`).join('\n');
  const importsRelations = imports.join('\n').replace(/\[|\]/g, '');

  const schemaContent = fields
    .map(
      f =>
        `  ${f.name}: schemaUtils.${enums.hasOwnProperty(f.type) ? `enum(${f.tsType})` : f.tsType === 'number' ? 'number' : 'string'}${f.required ? '.required()' : '.optional()'}${f.validation ? f.validation : ''},`,
    )
    .join('\n');

  const content = `${importEnums}${COMMON_IMPORT}` + importsRelations + `\nimport { z } from 'zod';\nimport { schemaUtils } from '${VALIDATION_UTILS}';\n\nexport const ${toCamelCase(entity)}Schema = z.object({\n${schemaContent}\n});\n\nexport interface ${entity}Model extends BaseRecordModel {\n${fieldsContent}\n}\n\nexport type Partial${entity}Model = PartialExceptOne<${entity}Model, 'id'>;`;

  fs.writeFileSync(modelPath, content);
}

function applyRelationships(entities, relationships) {
  relationships.forEach(({ type, sourceEntity, sourceField, targetEntity, targetField }) => {
    const sourceType = type.includes('Many') ? `Partial${targetEntity}Model[]` : `Partial${targetEntity}Model`;
    const targetType = type.includes('Many') ? `Partial${sourceEntity}Model[]` : `Partial${sourceEntity}Model`;

    if (!entities[sourceEntity].fields.some(f => f.name === sourceField)) {
      entities[sourceEntity].fields.push({ name: sourceField, tsType: sourceType });
    }
    if (!entities[targetEntity].fields.some(f => f.name === targetField)) {
      entities[targetEntity].fields.push({ name: targetField, tsType: targetType });
    }

    entities[sourceEntity].imports.push(`import { ${sourceType} } from '../${toKebabCase(targetEntity)}';`);
    entities[targetEntity].imports.push(`import { ${targetType} } from '../${toKebabCase(sourceEntity)}';`);
  });
}

function generateFromJDL() {
  if (!fs.existsSync(JDL_FILE)) {
    console.error(`JDL file not found: ${JDL_FILE}`);
    process.exit(1);
  }

  const { entities, enums, relationships } = parseJDL(JDL_FILE);
  applyRelationships(entities, relationships);
  generateEnums(enums);

  Object.entries(entities).forEach(([entity, data]) => {
    generateModel(entity, data, enums);
  });

  console.log('Models and relationships generated successfully.');
}

generateFromJDL();
