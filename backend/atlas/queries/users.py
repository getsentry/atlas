from datetime import date, timedelta

import graphene
import graphene_django_optimizer as gql_optimizer
from django.db.models import Q
from django.utils import timezone
from graphql.error import GraphQLError

from atlas.models import User
from atlas.schema import UserNode


class UserOrderBy(graphene.Enum):
    class Meta:
        name = "UserOrderBy"

    name = "name"
    dateStarted = "dateStarted"
    birthday = "birthday"
    anniversary = "anniversary"


class Query(object):
    users = graphene.List(
        UserNode,
        id=graphene.UUID(),
        email=graphene.String(),
        query=graphene.String(),
        employee_type=graphene.String(),
        include_self=graphene.Boolean(default_value=True),
        include_hidden=graphene.Boolean(default_value=False),
        humans_only=graphene.Boolean(default_value=True),
        titles_only=graphene.Boolean(default_value=False),
        office=graphene.UUID(),
        department=graphene.UUID(),
        reports_to=graphene.UUID(),
        referred_by=graphene.UUID(),
        date_started_before=graphene.types.datetime.Date(),
        date_started_after=graphene.types.datetime.Date(),
        anniversary_before=graphene.types.datetime.Date(),
        anniversary_after=graphene.types.datetime.Date(),
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
        email: str = None,
        query: str = None,
        employee_type: str = None,
        include_self: bool = True,
        include_hidden: bool = False,
        humans_only: bool = True,
        titles_only: bool = False,
        office: str = None,
        department: str = None,
        reports_to: str = None,
        referred_by: str = None,
        offset: int = 0,
        date_started_before: date = None,
        date_started_after: date = None,
        anniversary_before: date = None,
        anniversary_after: date = None,
        birthday_before: date = None,
        birthday_after: date = None,
        has_onboarded: bool = None,
        limit: int = 1000,
        order_by: str = None,
        **kwargs
    ):
        assert limit <= 1000
        assert offset >= 0

        current_user = info.context.user
        if not current_user.is_authenticated:
            raise GraphQLError("You must be authenticated")

        qs = User.objects.select_related("profile").filter(is_active=True).distinct()

        if not include_hidden:
            qs = qs.exclude(profile__is_directory_hidden=True)

        if id:
            qs = qs.filter(id=id)

        if email:
            qs = qs.filter(email__iexact=email)

        if office:
            qs = qs.filter(profile__office=office)

        if department:
            qs = qs.filter(
                Q(profile__department=department)
                | Q(profile__department__tree__contains=[department])
            )

        if employee_type:
            qs = qs.filter(profile__employee_type=employee_type)

        if reports_to:
            qs = qs.filter(profile__reports_to=reports_to)

        if referred_by:
            qs = qs.filter(profile__referred_by=referred_by)

        if query:
            qs = qs.filter(name__istartswith=query)

        if not include_self:
            qs = qs.exclude(id=current_user.id)

        if humans_only:
            qs = qs.filter(profile__is_human=True)

        if titles_only:
            qs = qs.filter(profile__title__isnull=False)

        if date_started_before:
            qs = qs.filter(profile__date_started__lt=date_started_before)

        if date_started_after:
            qs = qs.filter(profile__date_started__gt=date_started_after)

        if has_onboarded is True:
            qs = qs.filter(profile__has_onboarded=True)
        elif has_onboarded is False:
            qs = qs.filter(profile__has_onboarded=False)

        if anniversary_before:
            qs = qs.filter(
                Q(profile__date_started__month__lt=anniversary_before.month)
                | Q(
                    profile__date_started__month=anniversary_before.month,
                    profile__date_started__day__lt=anniversary_before.day,
                ),
                profile__date_started__lt=timezone.now() - timedelta(days=330),
            )

        if anniversary_after:
            qs = qs.filter(
                Q(profile__date_started__month__gt=anniversary_after.month)
                | Q(
                    profile__date_started__month=anniversary_after.month,
                    profile__date_started__day__gt=anniversary_after.day,
                ),
                profile__date_started__lt=timezone.now() - timedelta(days=330),
            )

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

        if order_by == "name" or not order_by:
            qs = qs.order_by("name")
        elif order_by == "dateStarted":
            qs = qs.filter(profile__date_started__isnull=False).order_by(
                "-profile__date_started"
            )
        elif order_by == "birthday":
            qs = qs.filter(profile__date_of_birth__isnull=False).order_by(
                "profile__date_of_birth__month", "profile__date_of_birth__day"
            )
        elif order_by == "anniversary":
            qs = qs.filter(profile__date_started__isnull=False).order_by(
                "profile__date_started__month", "profile__date_started__day"
            )

        return gql_optimizer.query(qs, info)[offset:limit]
