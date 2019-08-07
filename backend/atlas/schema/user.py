import logging

import graphene
import graphene_django_optimizer as gql_optimizer
from django.conf import settings

from atlas.models import Photo, Profile, User

from .dayschedule import DaySchedule
from .employeetype import EmployeeTypeEnum
from .phonenumber import PhoneNumberField
from .pronouns import Pronouns


def get_default_schedule():
    return [getattr(DaySchedule, x) for x in settings.DEFAULT_SCHEDULE]


def simple_profile_resolver(name):
    @gql_optimizer.resolver_hints(select_related=("profile"))
    def wrapped(self, info):
        if not self._state.fields_cache.get("profile"):
            logging.warning(f"Uncached resolution for UserNode.{name}")
        try:
            return getattr(self.profile, name)
        except Profile.DoesNotExist:
            return Profile(is_human=True, user=self)

    wrapped.__name__ = f"resolve_{name}"
    return wrapped


class ScheduleNode(graphene.ObjectType):
    sunday = DaySchedule(default_value=DaySchedule.OFF)
    monday = DaySchedule(default_value=DaySchedule.INOFFICE)
    tuesday = DaySchedule(default_value=DaySchedule.INOFFICE)
    wednesday = DaySchedule(default_value=DaySchedule.INOFFICE)
    thursday = DaySchedule(default_value=DaySchedule.INOFFICE)
    friday = DaySchedule(default_value=DaySchedule.INOFFICE)
    saturday = DaySchedule(default_value=DaySchedule.OFF)


class SocialNode(graphene.ObjectType):
    twitter = graphene.String(required=False)
    linkedin = graphene.String(required=False)
    github = graphene.String(required=False)


class GamerTagsNode(graphene.ObjectType):
    steam = graphene.String(required=False)
    xbox = graphene.String(required=False)
    playstation = graphene.String(required=False)
    nintendo = graphene.String(required=False)


class UserNode(gql_optimizer.OptimizedDjangoObjectType):
    email = graphene.String(required=False)
    photo = graphene.Field("atlas.schema.PhotoNode")

    # profile fields
    title = graphene.String(required=False)
    department = graphene.String(required=False)
    dob_day = graphene.Int(required=False)
    dob_month = graphene.Int(required=False)
    date_started = graphene.Date(required=False)
    tenure_percent = graphene.Float(required=False)
    date_of_birth = graphene.Date(required=False)
    primary_phone = PhoneNumberField(required=False)
    employee_type = graphene.Field("atlas.schema.EmployeeTypeNode", required=False)
    is_human = graphene.Boolean(required=False, default_value=True)
    office = graphene.Field("atlas.schema.OfficeNode")
    reports_to = graphene.Field("atlas.schema.UserNode", required=False)

    # custom profile bits
    handle = graphene.String(required=False)
    bio = graphene.String(required=False)
    pronouns = Pronouns(required=False)

    schedule = graphene.Field(ScheduleNode)
    social = graphene.Field(SocialNode)
    gamer_tags = graphene.Field(GamerTagsNode)

    # computed
    reports = graphene.List(lambda: UserNode)
    num_reports = graphene.Int(required=False)
    peers = graphene.List(lambda: UserNode)
    num_peers = graphene.Int(required=False)

    class Meta:
        model = User
        name = "User"
        fields = ("id", "email", "name", "is_active", "is_superuser")

    @gql_optimizer.resolver_hints(select_related=("profile__office"))
    def resolve_office(self, info):
        try:
            return self.profile.office
        except Profile.DoesNotExist:
            return None

    @gql_optimizer.resolver_hints(select_related=("profile"))
    def resolve_employee_type(self, info):
        try:
            enum = EmployeeTypeEnum[self.profile.employee_type or "NONE"]
        except KeyError:
            return None
        except Profile.DoesNotExist:
            return None
        return {"id": enum.name}

    @gql_optimizer.resolver_hints(select_related=("profile__reports_to"))
    def resolve_reports_to(self, info):
        try:
            return self.profile.reports_to
        except Profile.DoesNotExist:
            return None

    @gql_optimizer.resolver_hints(select_related=("photo"))
    def resolve_photo(self, info):
        if not self.id:
            return Photo()
        try:
            return self.photo
        except Photo.DoesNotExist:
            return None

    @gql_optimizer.resolver_hints(select_related=("profile"))
    def resolve_schedule(self, info):
        try:
            schedule = self.profile.schedule or get_default_schedule()
        except Profile.DoesNotExist:
            schedule = get_default_schedule()
        return {
            "sunday": schedule[0],
            "monday": schedule[1],
            "tuesday": schedule[2],
            "wednesday": schedule[3],
            "thursday": schedule[4],
            "friday": schedule[5],
            "saturday": schedule[6],
        }

    @gql_optimizer.resolver_hints(select_related=("profile"))
    def resolve_social(self, info):
        try:
            return {
                "linkedin": self.profile.linkedin,
                "github": self.profile.github,
                "twitter": self.profile.twitter,
            }
        except Profile.DoesNotExist:
            return {}

    @gql_optimizer.resolver_hints(select_related=("profile"))
    def resolve_gamer_tags(self, info):
        try:
            return {
                "steam": self.profile.steam,
                "xbox": self.profile.xbox,
                "playstation": self.profile.playstation,
                "nintendo": self.profile.nintendo,
            }
        except Profile.DoesNotExist:
            return {}

    def resolve_email(self, info):
        user = info.context.user
        if user.is_authenticated:
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
        return Profile.objects.filter(
            is_human=True, reports_to=self.id, user__is_active=True
        ).count()

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
        return [r.user for r in qs if r.user.is_active and r.is_human]

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
        return (
            Profile.objects.filter(
                is_human=True,
                reports_to=self.profile.reports_to_id,
                user__is_active=True,
            ).count()
            - 1
        )

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
        return [
            r.user
            for r in qs
            if r.user_id != self.id and r.user.is_active and r.is_human
        ]

    @gql_optimizer.resolver_hints(select_related=("profile"))
    def resolve_primary_phone(self, info):
        current_user = info.context.user
        if not current_user.is_authenticated:
            return None
        return self.profile.primary_phone

    @gql_optimizer.resolver_hints(select_related=("profile"))
    def resolve_date_of_birth(self, info):
        current_user = info.context.user
        if not current_user.is_authenticated:
            return None
        # dob is considered sensitive (the year) as it discloses age
        if current_user.is_superuser or current_user.id == self.id:
            return self.profile.date_of_birth
        return None

    @gql_optimizer.resolver_hints(select_related=("profile"))
    def resolve_dob_month(self, info):
        if not self.profile.date_of_birth:
            return None
        return self.profile.date_of_birth.month

    @gql_optimizer.resolver_hints(select_related=("profile"))
    def resolve_dob_day(self, info):
        if not self.profile.date_of_birth:
            return None
        return self.profile.date_of_birth.day

    resolve_handle = simple_profile_resolver("handle")
    resolve_bio = simple_profile_resolver("bio")
    resolve_title = simple_profile_resolver("title")
    resolve_department = simple_profile_resolver("department")
    resolve_date_started = simple_profile_resolver("date_started")
    resolve_is_human = simple_profile_resolver("is_human")
    resolve_pronouns = simple_profile_resolver("pronouns")

    # TODO(dcramer): this query is slow
    @gql_optimizer.resolver_hints(select_related=("profile"))
    def resolve_tenure_percent(self, info):
        if not self.profile.date_started:
            return None
        total = (
            Profile.objects.filter(
                user__is_active=True, date_started__isnull=False, is_human=True
            )
            .exclude(date_started=self.profile.date_started)
            .count()
        )
        newer_than_me = Profile.objects.filter(
            user__is_active=True,
            is_human=True,
            date_started__isnull=False,
            date_started__gt=self.profile.date_started,
        ).count()
        return (total - newer_than_me) / total
