export interface EntityModel {
  name: string;
  fields: FieldModel[];
  imports: string[];
}

export interface EntityObjectModel {
  [key: string]: EntityModel;
}

export interface RelationshipModel {
  type: string;
  sourceEntity: string;
  sourceField: string;
  targetEntity: string;
  targetField: string;
}

export interface JDLModel {
  entities: EntityModel[];
  relationships: RelationshipModel[];
}

export interface FieldModel {
  name: string;
  type?: string;
  required?: boolean;
  tsType?: string;
  validation?: string;
}
