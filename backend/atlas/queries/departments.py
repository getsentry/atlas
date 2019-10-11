import graphene
import graphene_django_optimizer as gql_optimizer
from graphql.error import GraphQLError

from atlas.models import Department
from atlas.schema import DepartmentNode


class Query(object):
    departments = graphene.List(
        DepartmentNode,
        id=graphene.UUID(),
        # root=graphene.UUID(),
        # parent=graphene.UUID(),
        query=graphene.String(),
        root_only=graphene.Boolean(default_value=False),
        people_only=graphene.Boolean(default_value=False),
        offset=graphene.Int(),
        limit=graphene.Int(),
    )

    def resolve_departments(
        self,
        info,
        id: str = None,
        # root: str = None,
        # parent: str = None,
        query: str = None,
        root_only: bool = False,
        people_only: bool = False,
        offset: int = 0,
        limit: int = 1000,
        **kwargs
    ):
        assert limit <= 1000
        assert offset >= 0

        current_user = info.context.user
        if not current_user.is_authenticated:
            raise GraphQLError("You must be authenticated")

        qs = Department.objects.all().distinct()

        if id:
            qs = qs.filter(id=id)

        # if parent:
        #     qs = qs.filter(parent=parent)

        # if root:
        #     qs = qs.filter(root=root)

        if root_only:
            qs = qs.filter(parent__isnull=True)

        if people_only:
            qs = qs.filter(
                profile__is_human=True, profile__user__is_active=True
            ).exclude(profile=None)

        if query:
            qs = qs.filter(name__istartswith=query)

        qs = qs.order_by("name")

        results = list(gql_optimizer.query(qs, info)[offset:limit])
        # see DepartmentNode for details on usage
        collected = {r.id: r for r in results}
        missing_ids = set()
        for r in results:
            for n in r.tree or ():
                if n not in collected:
                    missing_ids.add(n)
        collected.update(
            {d.id: d for d in Department.objects.filter(id__in=missing_ids)}
        )
        for r in results:
            r._tree_cache = [collected.get(i) for i in r.tree or ()]
        return results
