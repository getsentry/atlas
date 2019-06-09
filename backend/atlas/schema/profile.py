import graphene
from graphene_django.types import DjangoObjectType

from atlas.models import Profile


class ProfileNode(DjangoObjectType):
    handle = graphene.String(required=False)
    title = graphene.String(required=False)
    dob_day = graphene.Int(required=False)
    dob_month = graphene.Int(required=False)
    reports_to = graphene.Field("atlas.schema.UserNode", required=False)
    office = graphene.Field("atlas.schema.OfficeNode", required=False)
    date_started = graphene.Date(required=False)

    class Meta:
        model = Profile
        name = "Profile"
        only_fields = (
            "handle",
            "reports_to",
            "title",
            "date_started",
            "office",
            "photo_url",
            "department",
        )

    def resolve_dob_month(self, info):
        if not self.date_of_birth:
            return None
        return self.date_of_birth.month

    def resolve_dob_day(self, info):
        if not self.date_of_birth:
            return None
        return self.date_of_birth.day
