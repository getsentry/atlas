import graphene


class DaySchedule(graphene.Enum):
    WFH = "WFH"
    INOFFICE = "INOFFICE"
    OFF = "OFF"
    NONE = ""

    @property
    def description(self):
        if self == DaySchedule.WFH:
            return "Work From Home"
        if self == DaySchedule.INOFFICE:
            return "In Office"
        if self == DaySchedule.OFF:
            return "Off"
        return ""
