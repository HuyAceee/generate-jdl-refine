import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// import { execSync } from 'child_process';
import { parse } from '@typescript-eslint/typescript-estree';

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get command line parameters
const args = process.argv.slice(2);
if (args.length < 3) {
  console.error('❌ Usage: npm run generate <name> <ModelName> <ModelPath>');
  process.exit(1);
}

const folderName = args[0].toLowerCase();
const name = folderName.replace(/[\s-_]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
const modelName = args[1];
const modelPath = path.resolve(args[2]);
const targetDir = path.join(__dirname, `../src/pages/${folderName}`);

// Check if directory already exists
if (fs.existsSync(targetDir)) {
  console.error(`❌ Error: Target folder '${targetDir}' already exists.`);
  process.exit(1);
}

// Check if model.ts file exists
if (!fs.existsSync(modelPath)) {
  console.error(`❌ Error: Model file '${modelPath}' not found!`);
  process.exit(1);
}

// Read file model.ts
const modelsContent = fs.readFileSync(modelPath, 'utf-8');
const ast = parse(modelsContent, { loc: false, range: false });

let fields: { key: string; type: string }[] = [];

// Function to map TypeScript AST data type to standard type
const mapTSTypeToJS = (typeNode: any): string => {
  switch (typeNode.type) {
    case 'TSNumberKeyword':
      return 'number';
    case 'TSStringKeyword':
      return 'string';
    case 'TSBooleanKeyword':
      return 'boolean';
    case 'TSArrayType':
      return 'string[]'; // Display the list as string[]
    case 'TSTypeReference':
      return typeNode.typeName.name === 'Date' ? 'Date' : 'any'; // Support Date
    default:
      return 'any';
  }
};

// Read model from AST
if (ast.type === 'Program') {
  for (const node of ast.body) {
    if (
      node.type === 'ExportNamedDeclaration' &&
      node.declaration?.type === 'TSInterfaceDeclaration' &&
      node.declaration.id.name === modelName
    ) {
      fields = node.declaration.body.body.map((prop: any) => ({
        key: prop.key.name,
        type: mapTSTypeToJS(prop.typeAnnotation.typeAnnotation),
      }));
      break;
    }
  }
}

// If model not found
if (fields.length === 0) {
  console.error(`❌ Error: Model '${modelName}' not found in '${modelPath}'`);
  process.exit(1);
}

// Create list automatically
const columns = fields
  .map(({ key }) => `        <Table.Column dataIndex="${key}" title="${key.charAt(0).toUpperCase() + key.slice(1)}" />`)
  .join('\n');

const formFields = fields
  .map(
    ({ key, type }) =>
      `        <Form.Item label={'${key.charAt(0).toUpperCase() + key.slice(1)}'} name="${key}">\n          <${type === 'number' ? 'Input type="number"' : 'Input'} />\n        </Form.Item>`,
  )
  .join('\n');

const showFields = fields
  .map(
    ({ key }) =>
      `      <Title level={5}>{'${key.charAt(0).toUpperCase() + key.slice(1)}'}</Title>\n      <TextField value={record?.${key}} />`,
  )
  .join('\n');

const interfaceDef =
  `interface ${nameCapitalized}Model {\n` + fields.map(({ key, type }) => `  ${key}: ${type};`).join('\n') + `\n}\n`;

// Read template.json
const templatePath = path.join(__dirname, 'template.json');
if (!fs.existsSync(templatePath)) {
  console.error('❌ Error: template.json not found!');
  process.exit(1);
}

const template = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));

// Create new folder
fs.mkdirSync(targetDir, { recursive: true });

// Create each file in the new directory
Object.entries(template.files).forEach(([fileName, content]) => {
  if (typeof content !== 'string') {
    console.error(`❌ Error: File '${fileName}' content is not a valid string.`);
    process.exit(1);
  }

  const newContent = content
    .replace(/Employee/g, nameCapitalized)
    .replace(/employee/g, name)
    .replace('{{columns}}', columns)
    .replace('{{formFields}}', formFields)
    .replace('{{showFields}}', showFields)
    .replace('{{interface}}', interfaceDef)
    .replace('{{Name}}', nameCapitalized);

  fs.writeFileSync(path.join(targetDir, fileName.replace(/employee/gi, name)), newContent);
});

console.log(`✅ Successfully generated '${name}' module in '${targetDir}'!`);
