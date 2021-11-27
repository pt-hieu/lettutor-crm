import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDefaultAccount1635606151249 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const defaultAccount = {
            id: "a87d1d69-c868-4e78-afff-82a6e9dc1a28",
            email: "admin@mail.com",
            name: "admin",
            password: "$2b$10$VQppQ7laiBl4aUD6..WQMeuKMEOERITpkaBN4bhRkjVd9PEqE0qb6" // 123
        }

        const query = `INSERT INTO "user"("id", "created_at", "updated_at", "name", "email", "password", "role", "status") 
        VALUES ('${defaultAccount.id}', DEFAULT, DEFAULT, '${defaultAccount.name}', '${defaultAccount.email}', '${defaultAccount.password}', ARRAY['Super Admin']::user_role_enum[], 'Active');`;
        await queryRunner.query(query)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
