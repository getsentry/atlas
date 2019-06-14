import graphene

from .login import Login
from .sync_google import SyncGoogle
from .update_user import UpdateUser


class RootMutation(graphene.ObjectType):
    login = Login.Field()
    sync_google = SyncGoogle.Field()
    update_user = UpdateUser.Field()
