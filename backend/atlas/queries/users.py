import graphene
from django.db.models import Count
from graphql.error import GraphQLError

from atlas.models import User
from atlas.schema import UserNode
from atlas.utils.graphene import optimize_queryset


def fix_users_query(queryset, selected_fields, **kwargs):
    if "reports" in selected_fields:
        queryset = queryset.prefetch_related("reports", "reports__user")
    if "numReports" in selected_fields:
        queryset = queryset.annotate(num_reports=Count("reports"))
    return queryset


class UserOrderBy(graphene.Enum):
    class Meta:
        name = "UserOrderBy"

    name = "name"
    dateStarted = "dateStarted"


class Query(object):
    users = graphene.List(
        UserNode,
        id=graphene.UUID(),
        query=graphene.String(),
        include_self=graphene.Boolean(),
        office=graphene.UUID(),
        offset=graphene.Int(),
        limit=graphene.Int(),
        order_by=graphene.Argument(UserOrderBy),
    )

    def resolve_users(
        self,
        info,
        id: str = None,
        query: str = None,
        include_self: bool = True,
        office: str = None,
        offset: int = 0,
        limit: int = 1000,
        order_by: str = None,
        **kwargs
    ):
        assert limit <= 1000
        assert offset >= 0

        current_user = info.context.user
        if not current_user.is_authenticated:
            raise GraphQLError("You must be authenticated")

        qs = User.objects.filter(is_active=True)

        if id:
            qs = qs.filter(id=id)

        if office:
            qs = qs.filter(profile__office=office)

        if query:
            qs = qs.filter(name__istartswith=query)

        if not include_self:
            qs = qs.exclude(id=current_user.id)

        # exclude users without titles as they're mostly not real
        qs = qs.exclude(profile__title__isnull=True)

        qs = optimize_queryset(qs, info, "users", fix_users_query)

        if order_by == "name":
            qs = qs.order_by("name")
        elif order_by == "dateStarted":
            qs = qs.filter(profile__date_started__isnull=False).order_by(
                "-profile__date_started"
            )

        qs = qs[offset:limit]

        return qs
