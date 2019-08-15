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
    "employee_type": Profile,
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
    "referred_by": Profile,
}

# only HR can edit restricted fields
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
        "employee_type",
        "referred_by",
    ]
)

SUPERUSER_ONLY_FIELDS = frozenset(["is_human", "is_superuser"])
