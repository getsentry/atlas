from atlas.models import Profile, User

FIELD_MODEL_MAP = {
    "name": User,
    "handle": Profile,
    "date_of_birth": Profile,
    "date_started": Profile,
    "department": Profile,
    "title": Profile,
    "reports_to": Profile,
    "primary_phone": Profile,
    "is_human": Profile,
}

RESTRICTED_FIELDS = frozenset(
    ["name", "date_of_birth", "date_started", "title", "department", "reports_to"]
)

SUPERUSER_ONLY_FIELDS = frozenset(["is_human"])
