import { ValidationSchema } from 'class-validator'

export const ConvertToDealSchema: ValidationSchema = {
  name: 'ConvertToDeal',
  properties: {
    fullName: [
      {
        type: 'maxLength',
        constraints: [100],
      },
      {
        type: 'isString',
      },
      {
        type: 'isRequired',
      },
    ],
    amount: [
      {
        type: 'isOptional',
      },
      {
        type: 'isNumber',
      },
      {
        type: 'isRequired',
      },
    ],
    closingDate: [
      {
        type: 'isDate',
      },
    ],
    stageId: [
      {
        type: 'isUUID',
      },
      {
        type: 'isRequired',
      },
    ],
  },
}
