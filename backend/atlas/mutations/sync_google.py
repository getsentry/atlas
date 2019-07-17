import graphene

from atlas.tasks import sync_google


class SyncGoogle(graphene.Mutation):
    ok = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info):
        current_user = info.context.user
        if not current_user.is_authenticated:
            return SyncGoogle(ok=False, errors=["Authentication required"])

        if not current_user.is_superuser:
            return SyncGoogle(ok=False, errors=["Permission required"])

        sync_google()

        return SyncGoogle(ok=True)
