# prisma set-up

1. npm install prisma@6.3.1 --save-dev
2. npx prisma init
3. Create DB in pgAdmin
4. Update the DATABASE_URL in .env

# add schema

1. Define the schema in the prisma.schema file
2. Run -> npx prisma migrate dev --name create_task_model to sync the DB with your schema
3. Make sure @prisma/client is installed with thee 1st migration command
