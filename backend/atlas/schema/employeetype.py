import logging

import graphene

from atlas.models import Profile


class EmployeeTypeEnum(graphene.Enum):
    NONE = ""
    FULL_TIME = "Full-time"
    CONTRACT = "Contract"
    INTERN = "Intern"


class EmployeeTypeNode(graphene.ObjectType):
    id = graphene.String()
    name = graphene.String()
    num_people = graphene.Int(required=False)

    def resolve_num_people(self, info):
        if not self["id"]:
            return 0
        qs = Profile.objects.filter(employee_type=self["id"])
        if (
            not hasattr(self, "_prefetched_objects_cache")
            or "people" not in self._prefetched_objects_cache
        ):
            logging.warning("Uncached resolution for OfficeNode.num_people")
            qs = qs.select_related("user")
        return sum([1 for r in qs if r.user.is_active and r.is_human])

    def resolve_name(self, info):
        if not self["id"]:
            return "Unknown"
        return EmployeeTypeEnum[self["id"]].value
