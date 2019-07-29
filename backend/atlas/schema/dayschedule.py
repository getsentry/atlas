import graphene


class DaySchedule(graphene.Enum):
    WFH = "Work from Home"
    INOFFICE = "In Office"
    OFF = "Not Working"
    NONE = ""
