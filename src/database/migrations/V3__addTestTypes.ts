import knex from 'knex';

export async function up(db: knex) {
  await db.schema.createTable('test_type', (table) => {
    table.uuid('id').primary();
    table.string('name').unique().notNullable();
    table.jsonb('results_schema').notNullable();
    table.string('needed_permission_to_add_results').notNullable().index();
    table.jsonb('results_interpretation_rules').notNullable();
  });
}

export async function down(db: knex) {
  await db.schema.dropTable('test_type');
}
