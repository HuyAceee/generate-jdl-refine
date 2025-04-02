import { EntityObjectModel, RelationshipModel } from '../models/common';
import { pluralize, toKebabCase } from './format';

interface ApplyRelationshipsInput {
  entities: EntityObjectModel;
  relationships: RelationshipModel[];
}

export function applyRelationships({ entities, relationships }: ApplyRelationshipsInput) {
  relationships.forEach(({ type, sourceEntity, sourceField, targetEntity, targetField }) => {
    const sourceType = type.includes('Many') ? `Partial${targetEntity}Model` : `Partial${targetEntity}Model[]`;
    const targetType = type.includes('Many') ? `Partial${sourceEntity}Model` : `Partial${sourceEntity}Model[]`;

    if (!entities[sourceEntity].fields.some(f => f.name === sourceField)) {
      entities[sourceEntity].fields.push({ name: sourceField, tsType: sourceType });
    }
    if (!entities[targetEntity].fields.some(f => f.name === targetField)) {
      entities[targetEntity].fields.push({ name: targetField, tsType: targetType });
    }

    entities[sourceEntity].imports.push(`import { ${sourceType} } from '../${toKebabCase(pluralize(targetEntity))}';`);
    entities[targetEntity].imports.push(`import { ${targetType} } from '../${toKebabCase(pluralize(sourceEntity))}';`);
  });
}
