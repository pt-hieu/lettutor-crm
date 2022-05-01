import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateDefaultAccount1635606151249 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const defaultAccount = {
      id: 'c2180d62-2e80-477c-9ce8-26150696aafc',
      email: 'admin@mail.com',
      name: 'admin',
      password: '$2a$10$IOuioWuAWvx44fUVVLOEY.BEG4wKSXCKUSdJlwco1Ou/lmXbWXVJW', // Admin@123
    }

    const query = `INSERT INTO "user"("id", "created_at", "updated_at", "name", "email", "password", "status") 
        VALUES ('${defaultAccount.id}', DEFAULT, DEFAULT, '${defaultAccount.name}', '${defaultAccount.email}', '${defaultAccount.password}', 'Active');`
    await queryRunner.query(query)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
