const fs = require('fs')
const path = require('path')
const { parseJDL } = require('./parseJDL.cjs')
const { generateModel } = require('./generateModel.cjs')
const { generateEnums } = require('./generateEnum.cjs')
const { applyRelationships } = require('./applyRelationships.cjs')

const JDL_FILE = process.argv[2]
const MODEL_DIR = path.join(__dirname, 'src', 'models')
const COMMON_MODEL_DIR = path.join(MODEL_DIR, 'common')
const ENTITY_MODEL_DIR = path.join(MODEL_DIR, 'pages')
const ENUM_FILE = path.join(COMMON_MODEL_DIR, 'enum.ts')

function generateFromJDL() {
  if (!fs.existsSync(JDL_FILE)) {
    console.error(`JDL file not found: ${JDL_FILE}`)
    process.exit(1)
  }

  const { entities, enums, relationships } = parseJDL(JDL_FILE)
  applyRelationships(entities, relationships)
  generateEnums(enums, ENUM_FILE, COMMON_MODEL_DIR)

  Object.entries(entities).forEach(([entity, data]) => {
    generateModel(entity, data, ENTITY_MODEL_DIR, COMMON_MODEL_DIR, enums)
  })

  console.log('Models and relationships generated successfully.')
}

generateFromJDL()
