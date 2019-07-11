import graphene
from django.db import transaction

from atlas.models import Office
from atlas.schema import Decimal, OfficeNode


class UpdateOffice(graphene.Mutation):
    class Arguments:
        office = graphene.UUID(required=True)
        # name = graphene.String(required=False)
        location = graphene.String(required=False)
        lat = Decimal(required=False)
        lng = Decimal(required=False)

    ok = graphene.Boolean()
    errors = graphene.List(graphene.String)
    office = graphene.Field(OfficeNode)

    def mutate(self, info, office: str, **fields):
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
            update_fields = []
            for field, value in fields.items():
                if getattr(office, field) != value:
                    setattr(office, field, value)
                    update_fields.append(field)
            office.save(update_fields=update_fields)

        return UpdateOffice(ok=True, office=office)
