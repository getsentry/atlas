import os

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Run worker processes including crontab"

    def add_arguments(self, parser):
        parser.add_argument("--cron", dest="cron", action="store_true", default=True)
        parser.add_argument(
            "--no-cron", dest="cron", action="store_false", default=True
        )
        parser.add_argument("--log-level", dest="log_level", default="INFO")
        parser.add_argument("--concurrency", "-c", dest="concurrency", default=None)

    def handle(self, cron, log_level, concurrency, **options):
        command = [
            "celery",
            "--app=atlas.celery:app",
            "worker",
            f"--loglevel={log_level}",
            "--max-tasks-per-child=10000",
        ]
        if concurrency:
            command.append(f"--concurrency={concurrency}")
        if cron:
            command.append("--beat")

        os.execvp(command[0], command)
