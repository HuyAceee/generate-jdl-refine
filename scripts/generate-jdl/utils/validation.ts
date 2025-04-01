interface GenerateValidationInput {
  name: string;
  constraints: any[];
}

export function generateValidation({ name, constraints }: GenerateValidationInput) {
  const validation: string[] = [];
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
