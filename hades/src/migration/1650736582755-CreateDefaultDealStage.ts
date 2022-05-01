import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateDefaultDealStage1650736582755 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const openStage = {
      id: 'f6080706-3120-4fcf-896b-94003668d58f',
      name: 'Stage 1',
      type: 'Open',
      probability: 40,
      order: 1,
    }

    const closeWonStage = {
      id: 'd69e4d28-fe6f-4fd1-a06c-5105353ad495',
      name: 'Stage 2',
      type: 'Close Won',
      probability: 100,
      order: 2,
    }

    const closeLostStage = {
      id: 'c407fa3c-02e2-4622-96d1-cd43bb780ef1',
      name: 'Stage 3',
      type: 'Close Lost',
      probability: 0,
      order: 3,
    }

    const query = `INSERT INTO "deal_stage"("id", "created_at", "updated_at", "name", "type", "probability", "order") 
          VALUES ('${openStage.id}', DEFAULT, DEFAULT, '${openStage.name}', '${openStage.type}', '${openStage.probability}', '${openStage.order}'),
                 ('${closeWonStage.id}', DEFAULT, DEFAULT, '${closeWonStage.name}', '${closeWonStage.type}', '${closeWonStage.probability}', '${closeWonStage.order}'),
                 ('${closeLostStage.id}', DEFAULT, DEFAULT, '${closeLostStage.name}', '${closeLostStage.type}', '${closeLostStage.probability}', '${closeLostStage.order}');`
    await queryRunner.query(query)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
