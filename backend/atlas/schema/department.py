import graphene


class DepartmentNode(graphene.ObjectType):
    name = graphene.String()
    num_people = graphene.Int(required=False)

    # @gql_optimizer.resolver_hints(prefetch_related=("profiles", "profiles__user"))
    # def resolve_num_people(self, info):
    #     if not self.id:
    #         return 0
    #     if hasattr(self, "num_people"):
    #         return self.num_people
    #     qs = self.profiles.all()
    #     if (
    #         not hasattr(self, "_prefetched_objects_cache")
    #         or "people" not in self._prefetched_objects_cache
    #     ):
    #         logging.warning("Uncached resolution for OfficeNode.num_people")
    #         qs = qs.select_related("user")
    #     return sum([1 for r in qs if r.user.is_active and r.is_human])
