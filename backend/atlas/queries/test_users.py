from datetime import date

from atlas.models import Profile, User
import pytest

BASE_QUERY = """
query listUsers(
    $query: String,
    $includeSelf: Boolean,
    $orderBy: UserOrderBy,
    $dateStartedBefore: Date,
    $dateStartedAfter: Date,
    $birthdayBefore: Date,
    $birthdayAfter: Date,
    $anniversaryBefore: Date,
    $anniversaryAfter: Date
) {
    users(
        query: $query,
        includeSelf: $includeSelf,
        orderBy: $orderBy,
        dateStartedBefore: $dateStartedBefore,
        dateStartedAfter: $dateStartedAfter,
        birthdayBefore: $birthdayBefore,
        birthdayAfter: $birthdayAfter,
        anniversaryBefore: $anniversaryBefore,
        anniversaryAfter: $anniversaryAfter
    ) {
        results {
            id,
            email
        }
    }
}
"""


@pytest.fixture
def other_user(default_user, performance_team, ga_department):
    user = User.objects.create(name="Fizz Buzz", email="fizz.buzz@example.com")
    Profile.objects.create(
        user=user,
        reports_to=default_user,
        title="Dummy",
        date_started=date.today(),
        team=performance_team,
        department=ga_department,
    )
    return user


def test_users_shows_departments_facet(
    gql_client, default_user, other_user, design_department, ga_department
):
    executed = gql_client.execute(
        """{users {
            results { id }
            facets {
                departments { id, numPeople }
            }
        }}""",
        user=default_user,
    )
    result = executed["data"]["users"]
    assert len(result["facets"]["departments"]) == 2
    assert result["facets"]["departments"] == [
        {"id": str(design_department.id), "numPeople": 1},
        {"id": str(ga_department.id), "numPeople": 1},
    ]
    assert len(result["results"]) == 2


def test_users_shows_employee_types_facet(gql_client, default_user, other_user):
    executed = gql_client.execute(
        """{users {
            results { id }
            facets {
                employeeTypes { id, numPeople }
            }
        }}""",
        user=default_user,
    )
    result = executed["data"]["users"]
    assert len(result["facets"]["employeeTypes"]) == 1
    assert result["facets"]["employeeTypes"] == [
        {"id": str(default_user.profile.employee_type), "numPeople": 1}
    ]
    assert len(result["results"]) == 2


def test_users_shows_offices_facet(
    gql_client, default_user, default_office, other_user
):
    default_user.profile.office = default_office
    default_user.profile.save()
    executed = gql_client.execute(
        """{users {
            results { id }
            facets {
                offices { id, numPeople }
            }
        }}""",
        user=default_user,
    )
    result = executed["data"]["users"]
    assert len(result["facets"]["offices"]) == 1
    assert result["facets"]["offices"] == [
        {"id": str(default_user.profile.office_id), "numPeople": 1}
    ]
    assert len(result["results"]) == 2


def test_users_shows_reports(gql_client, default_user, other_user):
    executed = gql_client.execute(
        """{users(id:"%s") {
            results { id, email, reports { id }, numReports }
        }}"""
        % (str(default_user.id)),
        user=default_user,
    )
    result = executed["data"]["users"]
    assert len(result["results"]) == 1
    assert result["results"] == [
        {
            "id": str(default_user.id),
            "email": default_user.email,
            "reports": [{"id": str(other_user.id)}],
            "numReports": 1,
        }
    ]


def test_users_shows_date_of_birth(gql_client, default_user, other_user):
    executed = gql_client.execute(
        """{users(id:"%s") {
            results { dateOfBirth }
        }}"""
        % (str(default_user.id)),
        user=default_user,
    )
    result = executed["data"]["users"]
    assert len(result["results"]) == 1
    assert result["results"] == [
        {
            "dateOfBirth": default_user.profile.date_of_birth.replace(
                year=1900
            ).isoformat()
        }
    ]


def test_users_shows_self_email(gql_client, default_user):
    executed = gql_client.execute(BASE_QUERY, user=default_user)
    result = executed["data"]["users"]
    assert result["results"] == [
        {"id": str(default_user.id), "email": default_user.email}
    ]


def test_users_hide_self(gql_client, default_user):
    executed = gql_client.execute(
        BASE_QUERY, variables={"includeSelf": False}, user=default_user
    )
    assert executed["data"]["users"]["results"] == []


def test_users_shows_others_email(gql_client, default_user, other_user):
    executed = gql_client.execute(
        BASE_QUERY, variables={"query": "Fizz", "includeSelf": True}, user=default_user
    )
    assert executed["data"]["users"]["results"] == [
        {"id": str(other_user.id), "email": other_user.email}
    ]


def test_users_query_with_results(gql_client, default_user):
    executed = gql_client.execute(
        BASE_QUERY, variables={"query": "Jane", "includeSelf": True}, user=default_user
    )
    assert len(executed["data"]["users"]["results"]) == 1
    assert executed["data"]["users"]["results"][0]["id"] == str(default_user.id)


def test_users_query_no_results(gql_client, default_user):
    executed = gql_client.execute(
        BASE_QUERY, variables={"query": "Phish", "includeSelf": True}, user=default_user
    )
    assert executed["data"]["users"]["results"] == []


def test_users_by_start_date(gql_client, default_user, other_user):
    executed = gql_client.execute(
        BASE_QUERY, variables={"orderBy": "dateStarted"}, user=default_user
    )
    assert len(executed["data"]["users"]["results"]) == 2
    assert executed["data"]["users"]["results"][0]["id"] == str(other_user.id)
    assert executed["data"]["users"]["results"][1]["id"] == str(default_user.id)


def test_users_query_start_date(gql_client, default_user, other_user):
    executed = gql_client.execute(
        BASE_QUERY, variables={"dateStartedBefore": "2010-04-27"}, user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]["results"]) == 1
    assert executed["data"]["users"]["results"][0]["id"] == str(default_user.id)

    executed = gql_client.execute(
        BASE_QUERY, variables={"dateStartedAfter": "2010-04-27"}, user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]["results"]) == 1
    assert executed["data"]["users"]["results"][0]["id"] == str(other_user.id)


def test_users_by_birthday(gql_client, default_user, other_user):
    executed = gql_client.execute(
        BASE_QUERY, variables={"orderBy": "birthday"}, user=default_user
    )
    assert len(executed["data"]["users"]["results"]) == 1
    assert executed["data"]["users"]["results"][0]["id"] == str(default_user.id)


def test_users_query_birthday(gql_client, default_user):
    executed = gql_client.execute(
        BASE_QUERY, variables={"birthdayBefore": "2010-08-10"}, user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]["results"]) == 0

    executed = gql_client.execute(
        BASE_QUERY, variables={"birthdayBefore": "2010-08-13"}, user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]["results"]) == 1
    assert executed["data"]["users"]["results"][0]["id"] == str(default_user.id)

    executed = gql_client.execute(
        BASE_QUERY, variables={"birthdayAfter": "2010-08-13"}, user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]["results"]) == 0

    executed = gql_client.execute(
        BASE_QUERY, variables={"birthdayAfter": "2010-08-10"}, user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]["results"]) == 1
    assert executed["data"]["users"]["results"][0]["id"] == str(default_user.id)


def test_users_query_anniversary(gql_client, default_user):
    executed = gql_client.execute(
        BASE_QUERY, variables={"anniversaryBefore": "2012-04-25"}, user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]["results"]) == 0

    executed = gql_client.execute(
        BASE_QUERY, variables={"anniversaryBefore": "2012-04-30"}, user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]["results"]) == 1
    assert executed["data"]["users"]["results"][0]["id"] == str(default_user.id)

    executed = gql_client.execute(
        BASE_QUERY, variables={"anniversaryAfter": "2012-04-30"}, user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]["results"]) == 0

    executed = gql_client.execute(
        BASE_QUERY, variables={"anniversaryAfter": "2012-04-25"}, user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]["results"]) == 1
    assert executed["data"]["users"]["results"][0]["id"] == str(default_user.id)


def test_users_by_team(gql_client, default_user, other_user):
    executed = gql_client.execute(
        BASE_QUERY, variables={"orderBy": "team"}, user=default_user
    )
    assert len(executed["data"]["users"]["results"]) == 2
    assert executed["data"]["users"]["results"][0]["id"] == str(other_user.id)
    assert executed["data"]["users"]["results"][1]["id"] == str(default_user.id)


def test_users_by_department(gql_client, default_user, other_user):
    executed = gql_client.execute(
        BASE_QUERY, variables={"orderBy": "department"}, user=default_user
    )
    assert len(executed["data"]["users"]["results"]) == 2
    assert executed["data"]["users"]["results"][0]["id"] == str(default_user.id)
    assert executed["data"]["users"]["results"][1]["id"] == str(other_user.id)
