import logging

import graphene
import graphene_django_optimizer as gql_optimizer

from atlas.models import Profile, User


class UserNode(gql_optimizer.OptimizedDjangoObjectType):
    email = graphene.String(required=False)
    profile = graphene.Field("atlas.schema.ProfileNode")
    office = graphene.Field("atlas.schema.OfficeNode")
    reports = graphene.List(lambda: UserNode)
    num_reports = graphene.Int(required=False)
    peers = graphene.List(lambda: UserNode)
    num_peers = graphene.Int(required=False)

    class Meta:
        model = User
        name = "User"
        only_fields = ("id", "email", "name", "is_superuser")

    def resolve_profile(self, info):
        try:
            return self.profile
        except Profile.DoesNotExist:
            return Profile()

    def resolve_email(self, info):
        user = info.context.user
        if user.is_authenticated and user.id == self.id:
            return self.email
        return None

    # TODO(dcramer):
    # if "numReports" in selected_fields:
    #     queryset = queryset.annotate(num_reports=Count("reports"))
    def resolve_num_reports(self, info):
        if not self.id:
            return 0
        if hasattr(self, "num_reports"):
            return self.num_reports
        logging.warning("Uncached resolution for UserNode.num_reports")
        return Profile.objects.filter(reports_to=self.id).count()

    @gql_optimizer.resolver_hints(
        prefetch_related=("reports", "reports__user", "reports__user__profile")
    )
    def resolve_reports(self, info):
        if not self.id:
            return []
        qs = self.reports.all()
        if (
            not hasattr(self, "_prefetched_objects_cache")
            or "reports" not in self._prefetched_objects_cache
        ):
            logging.warning("Uncached resolution for UserNode.reports")
            qs = qs.select_related("user", "user__profile")
        return [r.user for r in qs]

    @gql_optimizer.resolver_hints(select_related=("profile"))
    def resolve_num_peers(self, info):
        if not self.id:
            return 0
        if not self.profile:
            return 0
        if not self.profile.reports_to_id:
            return 0
        if hasattr(self, "num_peers"):
            return self.num_reports
        logging.warning("Uncached resolution for UserNode.num_peers")
        return Profile.objects.filter(reports_to=self.profile.reports_to_id).count()

    @gql_optimizer.resolver_hints(
        select_related=("profile"),
        prefetch_related=(
            "profile__reports_to__reports",
            "profile__reports_to__reports__user",
            "profile__reports_to__reports__user__profile",
        ),
    )
    def resolve_peers(self, info):
        if not self.id:
            return []
        if not self.profile:
            return []
        if not self.profile.reports_to:
            return []
        qs = self.profile.reports_to.reports.all()
        if (
            not hasattr(self, "_prefetched_objects_cache")
            or "peers" not in self._prefetched_objects_cache
        ):
            logging.warning("Uncached resolution for UserNode.peers")
            qs = qs.select_related("user", "user__profile")
        return [r.user for r in qs]
