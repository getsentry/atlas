import os

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Run web process"

    def add_arguments(self, parser):
        parser.add_argument("--log-level", dest="log_level", default="INFO")
        parser.add_argument("--host", dest="host", default="127.0.0.1")
        parser.add_argument("--port", type=int, dest="port", default="8000")

    def handle(self, host, port, log_level, **options):
        command = ["gunicorn", f"-b {host}:{port}", "atlas.wsgi", "--log-file -"]
        os.execvp(command[0], command)
