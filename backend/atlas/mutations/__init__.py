import graphene

from .login import Login
from .update_user import UpdateUser


class RootMutation(graphene.ObjectType):
    login = Login.Field()
    update_user = UpdateUser.Field()
