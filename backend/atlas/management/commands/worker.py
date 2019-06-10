import os
import subprocess
import sys

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Run worker processes including crontab"

    def add_arguments(self, parser):
        parser.add_argument("--cron", dest="cron", action="store_true", default=True)
        parser.add_argument(
            "--no-cron", dest="cron", action="store_false", default=True
        )
        parser.add_argument("--log-level", dest="log_level", default="INFO")

    def handle(self, cron=True, log_level="INFO", **optiokns):
        command = [
            "celery",
            "--app=atlas.celery:app",
            "worker",
            "--loglevel={}".format(log_level),
            "--max-tasks-per-child=10000",
        ]
        if cron:
            command.extend(["--beat"])

        sys.exit(
            subprocess.call(
                command,
                cwd=os.getcwd(),
                env=os.environ,
                stdout=sys.stdout,
                stderr=sys.stderr,
            )
        )
