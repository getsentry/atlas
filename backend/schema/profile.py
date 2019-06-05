import graphene
from graphene_django.types import DjangoObjectType

from backend.models import Profile


class ProfileNode(DjangoObjectType):
    title = graphene.String(required=False)
    dob_day = graphene.Int(required=False)
    dob_month = graphene.Int(required=False)
    reports_to = graphene.Field("backend.schema.UserNode", required=False)
    office = graphene.Field("backend.schema.OfficeNode", required=False)
    date_started = graphene.Date(required=False)

    class Meta:
        model = Profile
        name = "Profile"
        only_fields = (
            "reports_to",
            "title",
            "date_started",
            "office",
            "photo_url",
            "department",
        )

    def resolve_dob_month(self, info):
        if not self.dob:
            return None
        return self.dob.month

    def resolve_dob_day(self, info):
        if not self.dob:
            return None
        return self.dob.day
