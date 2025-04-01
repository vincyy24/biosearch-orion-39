from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.experiments.models import Electrode, Instrument, VoltammetryTechnique
from django.db import transaction


class Command(BaseCommand):
    help = 'Initialize the models with default data'

    def handle(self, *args, **options):
        self.stdout.write('Initializing models with default data...')

        try:
            with transaction.atomic():
                # Create default methods
                # methods = ['Cyclic', 'Constant', 'Square wave']
                # for method_name in methods:
                #     Method.objects.get_or_create(name=method_name)
                # self.stdout.write(self.style.SUCCESS(f'Created {len(methods)} default methods'))

                # Create default electrodes
                electrodes = ['Glassy Carbon', 'Platinum', 'Gold']
                for electrode_type in electrodes:
                    Electrode.objects.get_or_create(type=electrode_type)
                self.stdout.write(self.style.SUCCESS(
                    f'Created {len(electrodes)} default electrodes'))

                # Create default instruments
                instruments = [
                    'Autolab PGSTAT', 'CHI Electrochemical Workstation', 'Gamry Potentiostat', 'MiniStat']
                for instrument_name in instruments:
                    Instrument.objects.get_or_create(name=instrument_name)
                self.stdout.write(self.style.SUCCESS(
                    f'Created {len(instruments)} default instruments'))

                # Create default voltammetry techniques
                techniques = ['Cyclic Voltammetry', 'Differential Pulse Voltammetry', 'Square Wave Voltammetry',
                              'Linear Sweep Voltammetry', 'Chronoamperometry']
                for technique_name in techniques:
                    VoltammetryTechnique.objects.get_or_create(
                        name=technique_name)
                self.stdout.write(self.style.SUCCESS(
                    f'Created {len(techniques)} default voltammetry techniques'))

                # Create a superuser if none exists
                if not User.objects.filter(is_superuser=True).exists():
                    User.objects.create_superuser(
                        username='admin',
                        email='admin@example.com',
                        password='admin'
                    )
                    self.stdout.write(self.style.SUCCESS(
                        'Created default superuser admin/admin'))

            self.stdout.write(self.style.SUCCESS(
                'Database initialized successfully!'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(
                f'Error initializing database: {str(e)}'))
