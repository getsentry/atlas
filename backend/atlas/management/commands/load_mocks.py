from django.core.management.base import BaseCommand

from atlas import factories


class Command(BaseCommand):
    help = "Load mock data"

    def handle(self, *args, **options):
        raise NotImplementedError("TODO")
        ceo = factories.ProfileFactory.create(ceo=True)
        print(f"Created {ceo}")
        cmo = factories.ProfileFactory.create(cmo=True, reports_to=ceo.user)
        print(f"Created {cmo}")
        cto = factories.ProfileFactory.create(cto=True, reports_to=ceo.user)
        print(f"Created {cto}")
        cpo = factories.ProfileFactory.create(cpo=True, reports_to=ceo.user)
        print(f"Created {cpo}")
        cfo = factories.ProfileFactory.create(cfo=True, reports_to=ceo.user)
        print(f"Created {cfo}")
        cro = factories.ProfileFactory.create(cfo=True, reports_to=ceo.user)
        print(f"Created {cro}")

        factories.ProfileFactory.create(reports_to=cmo.user, marketing=True)
