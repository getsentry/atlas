import graphene
from graphene_django.types import DjangoObjectType

from atlas.models import Profile

from .phonenumber import PhoneNumberField


class ProfileNode(DjangoObjectType):
    handle = graphene.String(required=False)
    title = graphene.String(required=False)
    dob_day = graphene.Int(required=False)
    dob_month = graphene.Int(required=False)
    reports_to = graphene.Field("atlas.schema.UserNode", required=False)
    office = graphene.Field("atlas.schema.OfficeNode", required=False)
    date_started = graphene.Date(required=False)
    date_of_birth = graphene.Date(required=False)
    primary_phone = PhoneNumberField(required=False)
    is_human = graphene.Boolean(required=False)

    class Meta:
        model = Profile
        name = "Profile"
        fields = (
            "handle",
            "reports_to",
            "title",
            "date_started",
            "office",
            "department",
            "primary_phone",
            "is_human",
        )

    def resolve_primary_phone(self, info):
        current_user = info.context.user
        if not current_user.is_authenticated:
            return None
        return self.primary_phone

    def resolve_date_of_birth(self, info):
        current_user = info.context.user
        if not current_user.is_authenticated:
            return None
        if current_user.is_superuser:
            return self.date_of_birth
        if current_user.id == self.id:
            return self.date_of_birth

    def resolve_dob_month(self, info):
        if not self.date_of_birth:
            return None
        return self.date_of_birth.month

    def resolve_dob_day(self, info):
        if not self.date_of_birth:
            return None
        return self.date_of_birth.day
