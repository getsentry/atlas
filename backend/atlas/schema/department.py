import logging

import graphene
import graphene_django_optimizer as gql_optimizer

from atlas.models import Department, Profile


class DepartmentNode(gql_optimizer.OptimizedDjangoObjectType):
    num_people = graphene.Int(required=False)
    # parent = graphene.Field(lambda: DepartmentNode)

    class Meta:
        model = Department
        name = "Department"
        fields = ("id", "name")

    def resolve_num_people(self, info):
        if not self.id:
            return 0
        qs = Profile.objects.filter(department=self.id)
        if (
            not hasattr(self, "_prefetched_objects_cache")
            or "people" not in self._prefetched_objects_cache
        ):
            logging.warning("Uncached resolution for DepartmentNode.num_people")
            qs = qs.select_related("user")
        return sum([1 for r in qs if r.user.is_active and r.is_human])
