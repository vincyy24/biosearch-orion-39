
from django.core.management.base import BaseCommand
from django.db import connection
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Initialize the database with initial data from SQL script'

    def handle(self, *args, **options):
        self.stdout.write('Initializing database with initial data...')
        
        # Path to the SQL file
        sql_file_path = os.path.join(settings.BASE_DIR, 'apps', 'api', 'migrations', 'initial_data.sql')
        
        # Read SQL file
        with open(sql_file_path, 'r') as sql_file:
            sql_statements = sql_file.read()
        
        # Execute SQL
        with connection.cursor() as cursor:
            cursor.executescript(sql_statements)
        
        self.stdout.write(self.style.SUCCESS('Database initialized successfully!'))
