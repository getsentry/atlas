from datetime import date

import graphene
import graphene_django_optimizer as gql_optimizer
from django.db.models import Q
from graphql.error import GraphQLError

from atlas.models import User
from atlas.schema import UserNode


class UserOrderBy(graphene.Enum):
    class Meta:
        name = "UserOrderBy"

    name = "name"
    dateStarted = "dateStarted"
    birthday = "birthday"


class Query(object):
    users = graphene.List(
        UserNode,
        id=graphene.UUID(),
        query=graphene.String(),
        include_self=graphene.Boolean(),
        office=graphene.UUID(),
        date_started_before=graphene.types.datetime.Date(),
        date_started_after=graphene.types.datetime.Date(),
        birthday_after=graphene.types.datetime.Date(),
        birthday_before=graphene.types.datetime.Date(),
        order_by=graphene.Argument(UserOrderBy),
        offset=graphene.Int(),
        limit=graphene.Int(),
    )

    def resolve_users(
        self,
        info,
        id: str = None,
        query: str = None,
        include_self: bool = True,
        office: str = None,
        offset: int = 0,
        date_started_before: date = None,
        date_started_after: date = None,
        birthday_before: date = None,
        birthday_after: date = None,
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

        if date_started_before:
            qs = qs.filter(profile__date_started__lt=date_started_before)

        if date_started_after:
            qs = qs.filter(profile__date_started__gt=date_started_after)

        if birthday_before:
            qs = qs.filter(
                Q(profile__date_of_birth__month__lt=birthday_before.month)
                | Q(
                    profile__date_of_birth__month=birthday_before.month,
                    profile__date_of_birth__day__lt=birthday_before.day,
                )
            )

        if birthday_after:
            qs = qs.filter(
                Q(profile__date_of_birth__month__gt=birthday_after.month)
                | Q(
                    profile__date_of_birth__month=birthday_after.month,
                    profile__date_of_birth__day__gt=birthday_after.day,
                )
            )

        # exclude users without titles as they're mostly not real
        qs = qs.exclude(profile__title__isnull=True)

        if order_by == "name":
            qs = qs.order_by("name")
        elif order_by == "dateStarted":
            qs = qs.filter(profile__date_started__isnull=False).order_by(
                "-profile__date_started"
            )
        elif order_by == "birthday":
            qs = qs.filter(profile__date_of_birth__isnull=False).order_by(
                "profile__date_of_birth__month", "profile__date_of_birth__day"
            )

        return gql_optimizer.query(qs, info)[offset:limit]
