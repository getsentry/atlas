from atlas.models import Profile, User

FIELD_MODEL_MAP = {
    "name": User,
    "is_superuser": User,
    "handle": Profile,
    "date_of_birth": Profile,
    "date_started": Profile,
    "schedule": Profile,
    "department": Profile,
    "title": Profile,
    "bio": Profile,
    "reports_to": Profile,
    "primary_phone": Profile,
    "is_contractor": Profile,
    "is_human": Profile,
    "office": Profile,
    "pronouns": Profile,
    "linkedin": Profile,
    "twitter": Profile,
    "github": Profile,
    "steam": Profile,
    "xbox": Profile,
    "playstation": Profile,
    "nintendo": Profile,
}

RESTRICTED_FIELDS = frozenset(
    [
        "name",
        "date_of_birth",
        "date_started",
        "title",
        "department",
        "reports_to",
        "office",
        "schedule",
        "is_contractor",
    ]
)

SUPERUSER_ONLY_FIELDS = frozenset(["is_human", "is_superuser"])
