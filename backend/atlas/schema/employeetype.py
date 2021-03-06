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
        if "num_people" in self:
            return self["num_people"]
        if not self["id"]:
            return 0
        qs = Profile.objects.filter(
            employee_type=self["id"], is_human=True, is_directory_hidden=False
        )
        if (
            not hasattr(self, "_prefetched_objects_cache")
            or "people" not in self._prefetched_objects_cache
        ):
            logging.warning("Uncached resolution for EmployeeTypeNode.num_people")
            qs = qs.select_related("user")
        return sum(
            [
                1
                for r in qs
                if r.user.is_active and r.is_human and not r.is_directory_hidden
            ]
        )

    def resolve_name(self, info):
        if not self["id"]:
            return "Unknown"
        return EmployeeTypeEnum[self["id"]].value


ALL_EMPLOYEE_TYPES = (
    EmployeeTypeEnum.FULL_TIME,
    EmployeeTypeEnum.CONTRACT,
    EmployeeTypeEnum.INTERN,
)
