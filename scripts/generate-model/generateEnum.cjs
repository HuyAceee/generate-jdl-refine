const fs = require('fs')

function generateEnums(enums, ENUM_FILE, COMMON_MODEL_DIR) {
  fs.mkdirSync(COMMON_MODEL_DIR, { recursive: true })
  let content = ''

  Object.entries(enums).forEach(([enumName, values]) => {
    content += `export enum ${enumName}Enum {\n`
    values.forEach(value => {
      content += `  ${value} = '${value}',\n`
    })
    content += `}\n\n`
  })

  fs.writeFileSync(ENUM_FILE, content)
}

module.exports = { generateEnums }
