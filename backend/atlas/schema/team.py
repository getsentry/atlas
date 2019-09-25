import logging

import graphene

from atlas.models import Profile


class TeamNode(graphene.ObjectType):
    name = graphene.String()
    num_people = graphene.Int(required=False)

    def resolve_num_people(self, info):
        if not self["name"]:
            return 0
        qs = Profile.objects.filter(team=self["name"])
        if (
            not hasattr(self, "_prefetched_objects_cache")
            or "people" not in self._prefetched_objects_cache
        ):
            logging.warning("Uncached resolution for TeamNode.num_people")
            qs = qs.select_related("user")
        return sum([1 for r in qs if r.user.is_active and r.is_human])
