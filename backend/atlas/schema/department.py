import logging

import graphene
import graphene_django_optimizer as gql_optimizer
from django.db.models import Q

from atlas.models import Department, Profile


class DepartmentNode(gql_optimizer.OptimizedDjangoObjectType):
    num_people = graphene.Int(required=False)
    parent = graphene.Field(lambda: DepartmentNode)
    tree = graphene.List(lambda: DepartmentNode)

    class Meta:
        model = Department
        name = "Department"
        fields = ("id", "name")

    def resolve_tree(self, info):
        if not self.id or not self.tree:
            return []
        if hasattr(self, "_tree_cache"):
            qs = self._tree_cache
        else:
            qs = Department.objects.filter(id__in=self.tree)
            if (
                not hasattr(self, "_prefetched_objects_cache")
                or "tree" not in self._prefetched_objects_cache
            ):
                logging.warning("Uncached resolution for DepartmentNode.tree")
            self._tree_cache = list(qs)
        if len(qs) != len(self.tree):
            logging.warning(
                "Missing nodes for DepartmentNode.tree (department_id=%s)", self.id
            )
        results = {d.id: d for d in qs if d}
        return [results[i] for i in self.tree]

    def resolve_num_people(self, info):
        if not self.id:
            return 0
        qs = Profile.objects.filter(
            Q(department=self.id) | Q(department__tree__contains=[self.id])
        )
        if (
            not hasattr(self, "_prefetched_objects_cache")
            or "people" not in self._prefetched_objects_cache
        ):
            logging.warning("Uncached resolution for DepartmentNode.num_people")
            qs = qs.select_related("user")
        return sum([1 for r in qs if r.user.is_active and r.is_human])
