const { toKebabCase } = require('./utils.cjs')

function applyRelationships(entities, relationships) {
  relationships.forEach(({ type, sourceEntity, sourceField, targetEntity, targetField }) => {
    const sourceType = type.includes('Many') ? `Partial${targetEntity}Model[]` : `Partial${targetEntity}Model`
    const targetType = type.includes('Many') ? `Partial${sourceEntity}Model[]` : `Partial${sourceEntity}Model`

    if (!entities[sourceEntity].fields.some(f => f.name === sourceField)) {
      entities[sourceEntity].fields.push({ name: sourceField, tsType: sourceType })
    }
    if (!entities[targetEntity].fields.some(f => f.name === targetField)) {
      entities[targetEntity].fields.push({ name: targetField, tsType: targetType })
    }

    entities[sourceEntity].imports.push(`import { ${sourceType} } from '../${toKebabCase(targetEntity)}';`)
    entities[targetEntity].imports.push(`import { ${targetType} } from '../${toKebabCase(sourceEntity)}';`)
  })
}

module.exports = { applyRelationships }
