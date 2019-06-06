import logging

import graphene
from graphene_django.types import DjangoObjectType

from atlas.models import Profile, User


class UserNode(DjangoObjectType):
    email = graphene.String(required=False)
    profile = graphene.Field("atlas.schema.ProfileNode")
    office = graphene.Field("atlas.schema.OfficeNode")
    reports = graphene.List(lambda: UserNode)
    num_reports = graphene.Int(required=False)

    class Meta:
        model = User
        name = "User"
        only_fields = ("id", "email", "name")

    def resolve_email(self, info):
        user = info.context.user
        if user.is_authenticated and user.id == self.id:
            return self.email
        return None

    def resolve_num_reports(self, info):
        if not self.id:
            return 0
        if hasattr(self, "num_reports"):
            return self.num_reports
        logging.warning("Uncached resolution for UserNode.num_reports")
        return Profile.objects.filter(reports_to=self.id).count()

    def resolve_reports(self, info):
        if not self.id:
            return 0
        qs = self.reports.all()
        if (
            not hasattr(self, "_prefetched_objects_cache")
            or "reports" not in self._prefetched_objects_cache
        ):
            logging.warning("Uncached resolution for UserNode.reports")
            qs = qs.select_related("user")
        return [r.user for r in qs]
