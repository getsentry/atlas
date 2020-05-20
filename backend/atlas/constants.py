from atlas.models import Profile, User

FIELD_MODEL_MAP = {
    "name": User,
    "is_superuser": User,
    "handle": Profile,
    "date_of_birth": Profile,
    "date_started": Profile,
    "schedule": Profile,
    "department": Profile,
    "team": Profile,
    "title": Profile,
    "bio": Profile,
    "reports_to": Profile,
    "primary_phone": Profile,
    "employee_type": Profile,
    "is_human": Profile,
    "is_directory_hidden": Profile,
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
    "has_onboarded": Profile,
}

# only HR can edit restricted fields
RESTRICTED_FIELDS = frozenset(
    [
        "name",
        "date_of_birth",
        "date_started",
        "title",
        "department",
        "team",
        "reports_to",
        "office",
        "employee_type",
        "referred_by",
    ]
)

SUPERUSER_ONLY_FIELDS = frozenset(
    ["is_human", "is_directory_hidden", "is_superuser", "has_onboarded"]
)

# attribute prefixes which are always booleans
BOOLEAN_PREFIXES = ("is_", "has_")

DEFAULT_VALUES = {
    "is_human": True,
    "is_directory_hidden": False,
    "has_onboarded": False,
    "employee_type": "FULL_TIME",
}
