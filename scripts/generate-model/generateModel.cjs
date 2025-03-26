const fs = require('fs')
const path = require('path')
const { toKebabCase } = require('./utils.cjs')

function generateModel(entity, { fields, imports }, ENTITY_MODEL_DIR, COMMON_MODEL_DIR, enums) {
  const entityFolder = toKebabCase(entity)
  const entityDir = path.join(ENTITY_MODEL_DIR, entityFolder)
  fs.mkdirSync(entityDir, { recursive: true })
  const modelPath = path.join(entityDir, 'index.ts')

  const hasEnum = fields.some(f => enums.hasOwnProperty(f.type))
  const importEnums = hasEnum ? `import { ${fields.map(f => f.tsType).join(', ')} } from '~/models/common/enum';\n` : ''

  const fieldsContent = fields.map(f => `  ${f.name}${f.required ? '' : '?'}: ${f.tsType};`).join('\n')

  const content = `${importEnums}import { BaseRecordModel } from '~/models/common';\n
export interface ${entity}Model extends BaseRecordModel {
${fieldsContent}
}`

  fs.writeFileSync(modelPath, content)
}

module.exports = { generateModel }
