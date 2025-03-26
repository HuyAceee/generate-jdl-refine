const fs = require('fs')
const { generateValidation, mapJDLTypeToTS } = require('./utils.cjs')

function parseJDL(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const entityRegex = /entity\s+(\w+)\s*\{([^}]*)\}/g
  const enumRegex = /enum\s+(\w+)\s*\{([^}]*)\}/g
  const relationRegex = /relationship\s+(OneToOne|OneToMany|ManyToOne|ManyToMany)\s*\{/g
  let match
  const entities = {}
  const enums = {}
  const relationships = []

  while ((match = enumRegex.exec(content)) !== null) {
    enums[match[1]] = match[2].trim().split(',').map(v => v.trim())
  }

  while ((match = entityRegex.exec(content)) !== null) {
    const entityName = match[1]
    const fields = match[2]
      .trim()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('//'))
      .map(line => {
        const parts = line.split(/\s+/)
        const name = parts[0]
        const type = parts[1]
        const constraints = parts.slice(2)
        const required = constraints.includes('required')
        const validation = generateValidation(name, type, constraints)
        return { name, type, tsType: mapJDLTypeToTS(type, enums), required, validation }
      })

    entities[entityName] = { fields, imports: [] }
  }

  return { entities, enums, relationships }
}

module.exports = { parseJDL }
