import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateDefaultRole1650736570180 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const adminRole = {
      id: 'bce822ca-4af7-4601-b17e-b00020854cbc',
      name: 'Admin',
      default: false,
    }

    const saleRole = {
      id: '2ce54996-ec58-4a9d-ad25-37104a30a8d0',
      name: 'Sale',
      default: true,
    }

    const query1 = `INSERT INTO "role"("id", "created_at", "updated_at", "name", "default") 
    VALUES ('${adminRole.id}', DEFAULT, DEFAULT, '${adminRole.name}', '${adminRole.default}'),
           ('${saleRole.id}', DEFAULT, DEFAULT, '${saleRole.name}', '${saleRole.default}');`
    await queryRunner.query(query1)

    const query2 = `INSERT INTO "user_roles_role"("userId", "roleId") 
    VALUES ('c2180d62-2e80-477c-9ce8-26150696aafc', 'bce822ca-4af7-4601-b17e-b00020854cbc');`
    await queryRunner.query(query2)

    const query3 = `INSERT INTO "role_actions_action"("roleId", "actionId") 
    VALUES ('bce822ca-4af7-4601-b17e-b00020854cbc', '69b6645f-fe2a-46e7-be53-e9fde6e4ef5e'),
           ('2ce54996-ec58-4a9d-ad25-37104a30a8d0', '6dce2f28-1b9c-470b-97b9-0d144e78db50');`
    await queryRunner.query(query3)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
