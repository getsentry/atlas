import graphene


class Pronouns(graphene.Enum):
    NONE = ""
    HE_HIM = "he / him"
    SHE_HER = "she / her"
    THEY_THEM = "they / them"
    OTHER = "other"
    DECLINE = "decline to choose"

    # @property
    # def description(self):
    #     if self == Episode.NEWHOPE:
    #         return 'New Hope Episode'
    #     return 'Other episode'
