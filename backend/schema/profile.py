import graphene
from graphene_django.types import DjangoObjectType

from backend.models import Profile


class ProfileNode(DjangoObjectType):
    title = graphene.String(required=False)
    dob_day = graphene.Int(required=False)
    dob_month = graphene.Int(required=False)
    reports_to = graphene.Field("backend.schema.UserNode", required=False)
    joined_at = graphene.Date(required=False)

    class Meta:
        model = Profile
        name = "Profile"
        only_fields = ("reports_to", "title", "joined_at")

    def resolve_dob_month(self, info):
        if not self.dob:
            return None
        return self.dob.month

    def resolve_dob_day(self, info):
        if not self.dob:
            return None
        return self.dob.day
