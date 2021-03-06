import graphene
from django.db import transaction

from atlas.models import Change, Office
from atlas.schema import Decimal, Nullable, OfficeNode


class OfficeInput(graphene.InputObjectType):
    # name = graphene.String(required=False)
    location = graphene.String(required=False)
    lat = Nullable(Decimal, required=False)
    lng = Nullable(Decimal, required=False)


class UpdateOffice(graphene.Mutation):
    class Arguments:
        office = graphene.UUID(required=True)
        data = OfficeInput(required=True)

    ok = graphene.Boolean()
    errors = graphene.List(graphene.String)
    office = graphene.Field(OfficeNode)

    def mutate(self, info, office: str, data: OfficeInput):
        current_user = info.context.user
        if not current_user.is_authenticated:
            return UpdateOffice(ok=False, errors=["Authentication required"])

        if not current_user.is_superuser:
            return UpdateOffice(ok=False, errors=["Superuser required"])

        try:
            office = Office.objects.get(id=office)
        except Office.DoesNotExist:
            return UpdateOffice(ok=False, errors=["Invalid user"])

        with transaction.atomic():
            updates = {}
            for field, value in data.items():
                if value == "":
                    value = None
                if getattr(office, field) != value:
                    updates[field] = value

            if updates:
                Change.record(office, updates, user=current_user)
                for key, value in updates.items():
                    setattr(office, key, value)
                office.save(update_fields=list(updates.keys()))

        return UpdateOffice(ok=True, office=office)
