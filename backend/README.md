
# Django Backend Setup

## Local Development Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create database tables:
   ```bash
   python manage.py migrate
   ```

3. Initialize the database with sample data:
   ```bash
   python manage.py initialize_db
   ```

4. Create a superuser (for admin access):
   ```bash
   python manage.py createsuperuser
   ```

5. Run the development server:
   ```bash
   python manage.py runserver
   ```

## Production Database Setup

For production, use a more robust database like PostgreSQL. Configure it using environment variables:

1. Install the PostgreSQL adapter:
   ```bash
   pip install psycopg2-binary
   ```

2. Set the DATABASE_URL environment variable:
   ```bash
   export DATABASE_URL=postgres://username:password@hostname:port/database
   ```

3. Common database URLs:
   - PostgreSQL: `postgres://username:password@hostname:port/database`
   - MySQL: `mysql://username:password@hostname:port/database`

4. Run migrations to initialize the production database:
   ```bash
   python manage.py migrate
   ```

5. Load initial data:
   ```bash
   python manage.py initialize_db
   ```

## Environment Variables

- `DEBUG`: Set to "False" in production
- `ALLOWED_HOSTS`: Comma-separated list of allowed hostnames
- `DATABASE_URL`: Database connection URL for production
- `SECRET_KEY`: Django secret key (generate a new one for production)

## Database Backup and Restore

For backing up and restoring your PostgreSQL database:

### Backup:
```bash
pg_dump -U username database_name > backup.sql
```

### Restore:
```bash
psql -U username database_name < backup.sql
```

For SQLite, you can simply copy the db.sqlite3 file.
