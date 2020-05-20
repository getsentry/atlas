import graphene
from django.db import transaction

from atlas.models import Profile, Team
from atlas.tasks import update_profile


class DeleteTeam(graphene.Mutation):
    class Arguments:
        team = graphene.UUID(required=True)
        new_team = graphene.UUID(required=False)

    ok = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, team: str, new_team: str = None):
        current_user = info.context.user
        if not current_user.is_authenticated:
            return DeleteTeam(ok=False, errors=["Authentication required"])

        if team == new_team:
            return DeleteTeam(ok=False, errors=["Must select a unique new team"])

        try:
            team = Team.objects.get(id=team)
        except Team.DoesNotExist:
            return DeleteTeam(ok=False, errors=["Invalid resource"])

        if new_team:
            try:
                new_team = Team.objects.get(id=new_team)
            except Team.DoesNotExist:
                return DeleteTeam(ok=False, errors=["Invalid resource"])

        # only superuser (human resources) can edit teams
        if not current_user.is_superuser:
            return DeleteTeam(ok=False, errors=["Cannot edit this resource"])

        # XXX(dcramer): this is potentially a very long transaction
        with transaction.atomic():
            team_id = team.id
            affected_users = []
            for user_id in Profile.objects.filter(team=team_id).values_list(
                "user", flat=True
            ):
                affected_users.append(user_id)
                Profile.objects.filter(user=user_id).update(team=new_team)

            team.delete()

            for user_id in affected_users:
                update_profile.delay(
                    user_id=user_id,
                    updates={"team": str(new_team.id) if new_team else None},
                )

        return DeleteTeam(ok=True)
