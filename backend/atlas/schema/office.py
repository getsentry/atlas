import logging

import graphene
import graphene_django_optimizer as gql_optimizer

from atlas.models import Office

from .decimal import Decimal


class OfficeNode(gql_optimizer.OptimizedDjangoObjectType):
    lat = Decimal(required=False)
    lng = Decimal(required=False)
    num_people = graphene.Int(required=False)

    class Meta:
        model = Office
        name = "Office"
        fields = (
            "id",
            "external_id",
            "name",
            "description",
            "location",
            "region_code",
            "postal_code",
            "locality",
            "administrative_area",
            "lat",
            "lng",
        )

    @gql_optimizer.resolver_hints(prefetch_related=("profiles", "profiles__user"))
    def resolve_num_people(self, info):
        if hasattr(self, "num_people"):
            return self.num_people
        if not self.id:
            return 0
        qs = self.profiles.filter(is_human=True, is_directory_hidden=False)
        if (
            not hasattr(self, "_prefetched_objects_cache")
            or "people" not in self._prefetched_objects_cache
        ):
            logging.warning("Uncached resolution for OfficeNode.num_people")
            qs = qs.select_related("user")
        return sum(
            [
                1
                for r in qs
                if r.user.is_active and r.is_human and not r.is_directory_hidden
            ]
        )

    @gql_optimizer.resolver_hints(prefetch_related=("profiles", "profiles__user"))
    def resolve_people(self, info):
        if not self.id:
            return []
        qs = self.profiles.filter(is_human=True, is_directory_hidden=False)
        if (
            not hasattr(self, "_prefetched_objects_cache")
            or "people" not in self._prefetched_objects_cache
        ):
            logging.warning("Uncached resolution for OfficeNode.people")
            qs = qs.select_related("user")
        return [
            r.user
            for r in qs
            if r.user.is_active and r.is_human and not r.is_directory_hidden
        ]
