import { ValidationSchema } from 'class-validator'
import { DealStage } from 'src/deal/deal.entity'

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
        type: "isDate"
      }
    ],
    stage: [{
      type: "isOptional"
    }, {
      type: "isEnum",
      constraints: [DealStage]
    }]
  },
}
