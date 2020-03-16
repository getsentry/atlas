import graphene

from .create_department import CreateDepartment
from .delete_department import DeleteDepartment
from .import_csv import ImportCsv
from .login import Login
from .sync_google import SyncGoogle
from .update_department import UpdateDepartment
from .update_office import UpdateOffice
from .update_people import UpdatePeople
from .update_user import UpdateUser


class RootMutation(graphene.ObjectType):
    create_department = CreateDepartment.Field()
    delete_department = DeleteDepartment.Field()
    import_csv = ImportCsv.Field()
    login = Login.Field()
    sync_google = SyncGoogle.Field()
    update_department = UpdateDepartment.Field()
    update_office = UpdateOffice.Field()
    update_people = UpdatePeople.Field()
    update_user = UpdateUser.Field()
