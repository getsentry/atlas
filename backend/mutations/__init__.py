import graphene

from .login import Login


class RootMutation(graphene.ObjectType):
    login = Login.Field()
