import graphene

from .dayschedule import DaySchedule
from .nullable import Nullable
from .phonenumber import PhoneNumberField
from .pronouns import Pronouns


class ScheduleInput(graphene.InputObjectType):
    sunday = DaySchedule(default_value=DaySchedule.OFF)
    monday = DaySchedule(default_value=DaySchedule.INOFFICE)
    tuesday = DaySchedule(default_value=DaySchedule.INOFFICE)
    wednesday = DaySchedule(default_value=DaySchedule.INOFFICE)
    thursday = DaySchedule(default_value=DaySchedule.INOFFICE)
    friday = DaySchedule(default_value=DaySchedule.INOFFICE)
    saturday = DaySchedule(default_value=DaySchedule.OFF)


class SocialInput(graphene.InputObjectType):
    linkedin = graphene.String(required=False)
    github = graphene.String(required=False)
    twitter = graphene.String(required=False)


class GamerTagsInput(graphene.InputObjectType):
    steam = graphene.String(required=False)
    xbox = graphene.String(required=False)
    playstation = graphene.String(required=False)
    nintendo = graphene.String(required=False)


class UserInput(graphene.InputObjectType):
    id = graphene.UUID(required=False)
    name = graphene.String(required=False)
    handle = graphene.String(required=False)
    bio = graphene.String(required=False)
    pronouns = Pronouns(required=False)
    date_of_birth = Nullable(graphene.Date, required=False)
    date_started = Nullable(graphene.Date, required=False)
    employee_type = graphene.String(required=False)
    title = graphene.String(required=False)
    department = graphene.String(required=False)
    reports_to = Nullable(graphene.UUID, required=False)
    primary_phone = Nullable(PhoneNumberField, required=False)
    is_human = graphene.Boolean(required=False)
    office = Nullable(graphene.UUID, required=False)
    is_superuser = graphene.Boolean(required=False)
    social = Nullable(SocialInput, required=False)
    gamer_tags = Nullable(GamerTagsInput, required=False)
    schedule = Nullable(ScheduleInput, required=False)
