import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  isUUID,
} from 'class-validator'

@ValidatorConstraint({ async: false })
export class EntityValidator implements ValidatorConstraintInterface {
  validate(entities: unknown, args: ValidationArguments) {
    if (typeof entities === 'string') {
      return isUUID(entities)
    }

    if (Array.isArray(entities)) {
      return entities.every((entity) => isUUID(entity))
    }

    return false
  }

  defaultMessage(args: ValidationArguments) {
    return 'Entities has to be an UUID or an array of UUIDs'
  }
}
