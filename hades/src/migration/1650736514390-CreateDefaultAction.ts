import { getConnection, MigrationInterface, QueryRunner } from 'typeorm'

export class CreateDefaultAction1650736514390 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const defaultActions = [
      {
        id: '69b6645f-fe2a-46e7-be53-e9fde6e4ef5e',
        target: 'admin',
        type: 'Can do anything',
      },
      {
        id: '6dce2f28-1b9c-470b-97b9-0d144e78db50',
        target: 'sale',
        type: 'Can create any except user and role',
      },
      {
        id: '6d0d5d33-2c32-4611-af43-176d7f3e0d3f',
        target: 'user',
        type: 'Can view all',
      },
      {
        id: 'fd978bb2-ab84-4ef0-9150-1d0bc3fe973c',
        target: 'user',
        type: 'Can view detail any',
      },
      {
        id: '65e631de-4593-420f-a4d1-79bac0e33abf',
        target: 'user',
        type: 'Can view detail and edit any',
      },
      {
        id: '55442969-835f-4e2d-8162-f374f5c58d5d',
        target: 'user',
        type: 'Can create new',
      },
      {
        id: '5628f937-a372-4d9b-ae61-81eb91a68fb9',
        target: 'user',
        type: 'Can delete any',
      },
      {
        id: 'c5e306bd-a963-4b25-93cb-090acb8f6e17',
        target: 'role',
        type: 'Can delete any',
      },
      {
        id: '3aa46f18-b63e-48bc-96bc-54d21f16a9a8',
        target: 'role',
        type: 'Can create new',
      },
      {
        id: '2ef4f090-c9cf-4e45-8bc1-287cc117bab2',
        target: 'role',
        type: 'Can restore reserved',
      },
      {
        id: '7c24a160-5f6e-4d04-8b0d-10fecc9a5ed6',
        target: 'role',
        type: 'Can view detail and edit any',
      },
      {
        id: '8224b576-67ca-49b7-b0ff-91edb0a8de7f',
        target: 'task',
        type: 'Can view all',
      },
      {
        id: 'e504399d-e2bf-41e5-abd7-23e7c2467b57',
        target: 'task',
        type: 'Can view detail any',
      },
      {
        id: '2af22880-4a04-4657-b110-1440890eb849',
        target: 'task',
        type: 'Can view detail and edit any',
      },
      {
        id: '2279d674-8d7b-47a0-b5b1-1f49c26f3876',
        target: 'task',
        type: 'Can create new',
      },
      {
        id: 'e909ab56-cad5-405f-b39b-58601d6a3a3f',
        target: 'task',
        type: 'Can close any',
      },
      {
        id: 'b853f5f1-da41-435d-9406-7906186b12b9',
        target: 'task',
        type: 'Can delete any',
      },
      {
        id: 'd7c56ca7-c938-4894-a3a6-b33548f31775',
        target: 'note',
        type: 'Can view all',
      },
      {
        id: '844d1ffe-63fb-443b-aa25-4f90ad0d362e',
        target: 'note',
        type: 'Can create new',
      },
      {
        id: '454deeff-5d63-417e-8bfd-add3e64e9abe',
        target: 'note',
        type: 'Can delete any',
      },
      {
        id: '49177164-62e7-4436-875f-8a04605b1533',
        target: 'deal stage',
        type: 'Can view all',
      },
      {
        id: '6343db89-6605-449b-9b3c-4c51bcb621cf',
        target: 'deal stage',
        type: 'Can view detail and edit any',
      },
      {
        id: '45d478c4-fb5b-4051-9521-5226fc1577ac',
        target: 'lead',
        type: 'Can view all',
      },
      {
        id: '3a79dcd4-5961-4f7c-80eb-6b238cfa1f6f',
        target: 'lead',
        type: 'Can view detail any',
      },
      {
        id: 'd5143799-49d5-48b7-93c4-de463bba8252',
        target: 'lead',
        type: 'Can view detail and edit any',
      },
      {
        id: 'bc8e41e7-db9d-41b2-85ab-672d6b8f5446',
        target: 'lead',
        type: 'Can create new',
      },
      {
        id: '249408ed-62ef-454f-8ee4-7c5750dbb999',
        target: 'lead',
        type: 'Can convert any',
      },
      {
        id: '7e9d8355-9201-41fe-927c-44806d5368f2',
        target: 'lead',
        type: 'Can delete any',
      },
      {
        id: '3fa40656-8028-41cc-877b-6e88056324b5',
        target: 'contact',
        type: 'Can view all',
      },
      {
        id: '5f2e1c6d-e6bc-4714-b516-585a95b3ad40',
        target: 'contact',
        type: 'Can view detail any',
      },
      {
        id: 'a4ce8a7b-71a6-4b0b-8da9-d0857fb767b4',
        target: 'contact',
        type: 'Can view detail and edit any',
      },
      {
        id: '6590bed5-ba92-4255-a9d5-471fd010eecd',
        target: 'contact',
        type: 'Can create new',
      },
      {
        id: '02adc47b-368a-49fa-b676-b5d1989a41f6',
        target: 'contact',
        type: 'Can delete any',
      },
      {
        id: 'e84d36a6-1dca-483e-a516-c50fe3c4e2bc',
        target: 'account',
        type: 'Can view all',
      },
      {
        id: '5ad7e044-dcf5-4bb8-aba1-97157a2cee58',
        target: 'account',
        type: 'Can view detail any',
      },
      {
        id: 'd13acb11-40c5-4558-9b78-f610adb12e08',
        target: 'account',
        type: 'Can view detail and edit any',
      },
      {
        id: '4d2efd13-fba6-495e-80e5-431da99edace',
        target: 'account',
        type: 'Can create new',
      },
      {
        id: '848b4def-2e03-4e82-90cc-9a4b78e9c843',
        target: 'account',
        type: 'Can delete any',
      },
      {
        id: 'eaf36c47-0cbd-4154-acc4-c0a828256135',
        target: 'deal',
        type: 'Can view all',
      },
      {
        id: 'f96e9cd1-92c3-4271-bfc8-8a7ea6518b9c',
        target: 'deal',
        type: 'Can view detail any',
      },
      {
        id: 'd040f39c-2db2-40e0-b898-d9b6aee590b9',
        target: 'deal',
        type: 'Can view detail and edit any',
      },
      {
        id: 'b4278852-37c4-4fc6-a720-1ae58be3b9fb',
        target: 'deal',
        type: 'Can create new',
      },
      {
        id: '8533a7c5-40f2-49ae-8074-9b4d8526cc9b',
        target: 'deal',
        type: 'Can delete any',
      },
    ]

    for (const action of defaultActions) {
      let query = `INSERT INTO "action"("id", "created_at", "updated_at", "target", "type") 
      VALUES ('${action.id}', DEFAULT, DEFAULT, '${action.target}', '${action.type}');`

      await queryRunner.query(query)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
