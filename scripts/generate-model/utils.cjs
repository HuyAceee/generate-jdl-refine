function capitalizeFirstLetter(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

function generateValidation(name, type, constraints) {
  const validation = []
  if (name.toLowerCase().includes('email')) validation.push('.email()')
  if (name.toLowerCase().includes('phone')) validation.push('.phone()')
  if (name.toLowerCase().includes('url')) validation.push('.url()')

  constraints.forEach(constraint => {
    if (constraint.startsWith('min')) validation.push(`.min(${constraint.match(/\d+/)[0]})`)
    if (constraint.startsWith('max')) validation.push(`.max(${constraint.match(/\d+/)[0]})`)
  })

  return validation.join('')
}

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

module.exports = { capitalizeFirstLetter, toKebabCase, generateValidation, mapJDLTypeToTS }
