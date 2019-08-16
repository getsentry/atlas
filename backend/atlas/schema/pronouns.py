import graphene


class Pronouns(graphene.Enum):
    NONE = ""
    HE_HIM = "HE_HIM"
    SHE_HER = "SHE_HER"
    THEY_THEM = "THEY_THEM"
    OTHER = "OTHER"
    DECLINE = "DECLINE"

    @property
    def description(self):
        if self == Pronouns.HE_HIM:
            return "he / him"
        if self == Pronouns.SHE_HER:
            return "she / her"
        if self == Pronouns.THEY_THEM:
            return "they / them"
        if self == Pronouns.OTHER:
            return "other"
        if self == Pronouns.DECLINE:
            return "decline to choose"
        return ""
