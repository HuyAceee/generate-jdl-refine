import fs from 'fs';
import { EntityModel, EntityObjectModel, FieldModel, RelationshipModel } from '../models/common';
import { generateValidation } from './validation';

interface MapJDLTypeToTSInputModel {
  jdlType: string;
  enums: Record<string, string[]>;
}

export function mapJDLTypeToTS({ jdlType, enums }: MapJDLTypeToTSInputModel) {
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

export function parseJDL(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Cannot find file JDL: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const entityRegex = /entity\s+(\w+)\s*\{([^}]*)\}/g;
  const enumRegex = /enum\s+(\w+)\s*\{([^}]*)\}/g;
  const relationRegex = /relationship\s+(OneToOne|OneToMany|ManyToOne|ManyToMany)\s*\{/g;
  let match;
  const entities: EntityModel[] = [];
  const enums: Record<string, string[]> = {};
  const relationships: RelationshipModel[] = [];

  // Parse enums
  while ((match = enumRegex.exec(content)) !== null) {
    enums[match[1]] = match[2]
      .trim()
      .split(',')
      .map(value => value.trim());
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
    const entityName = match[1];
    let fields: FieldModel[] = match[2]
      .trim()
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line && !line.startsWith('//'))
      .map((line: string) => {
        const parts = line.split(/\s+/);
        return { name: parts[0], type: mapJDLTypeToTS({ jdlType: parts[1], enums }) };
      });
    relationships.forEach(relationship => {
      if (relationship.sourceEntity === entityName) {
        fields.push({
          name: relationship.sourceField,
          type: `Partial${relationship.targetEntity}Model${relationship.type === 'OneToMany' || relationship.type === 'ManyToMany' ? '[]' : ''}`,
        });
      } else if (relationship.targetEntity === entityName) {
        fields.push({
          name: relationship.targetField,
          type: `Partial${relationship.sourceEntity}Model${relationship.type === 'ManyToOne' || relationship.type === 'ManyToMany' ? '[]' : ''}`,
        });
      }
    });

    entities.push({ name: entityName, fields, imports: [] });
  }

  if (entities.length === 0) {
    console.error('❌ No entity found in JDL file.');
    process.exit(1);
  }

  return { entities, enums, relationships };
}

export function parseJDLModel(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const entityRegex = /entity\s+(\w+)\s*\{([^}]*)\}/g;
  const enumRegex = /enum\s+(\w+)\s*\{([^}]*)\}/g;
  const relationRegex = /relationship\s+(OneToOne|OneToMany|ManyToOne|ManyToMany)\s*\{/g;
  let match;
  const entities: EntityObjectModel = {};
  const enums: Record<string, string[]> = {};
  const relationships: RelationshipModel[] = [];

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
      .map((line: string) => line.trim())
      .filter((line: string) => line && !line.startsWith('//'))
      .map((line: string) => {
        const parts = line.split(/\s+/);
        const name = parts[0];
        const type = parts[1];
        const constraints = parts.slice(2);
        const required = constraints.includes('required');
        const validation = generateValidation({ name, constraints });
        return { name, type, tsType: mapJDLTypeToTS({ jdlType: type as string, enums }), required, validation };
      });
    entities[entityName] = { name: '', fields, imports: [] };
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
      const sourceField = _sourceField.match(/^(\w+)\(/)?.[1] || _sourceField;
      const targetField = _targetField.match(/^(\w+)\(/)?.[1] || _targetField;
      relationships.push({ type: relationType, sourceEntity, sourceField, targetEntity, targetField });
    });
  }
  console.log('1233333333333333', entities);

  return { entities, enums, relationships };
}
