import gql from "graphql-tag";

export const GET_OFFICE_QUERY = gql`
  query getOffice($id: UUID!) {
    offices(id: $id) {
      id
      name
      location
      lat
      lng
    }
  }
`;

export const LIST_PEOPLE_QUERY = gql`
  query listPeople(
    $office: UUID
    $dateStartedBefore: Date
    $dateStartedAfter: Date
    $birthdayBefore: Date
    $birthdayAfter: Date
    $query: String
    $includeSelf: Boolean
    $orderBy: UserOrderBy
    $offset: Int
    $limit: Int
  ) {
    users(
      office: $office
      dateStartedBefore: $dateStartedBefore
      dateStartedAfter: $dateStartedAfter
      birthdayBefore: $birthdayBefore
      birthdayAfter: $birthdayAfter
      query: $query
      includeSelf: $includeSelf
      orderBy: $orderBy
      offset: $offset
      limit: $limit
    ) {
      id
      name
      email
      profile {
        title
        photoUrl
        dobMonth
        dobDay
        dateStarted
        reportsTo {
          id
        }
      }
    }
  }
`;

export const GET_PERSON_QUERY = gql`
  query getPerson($email: String) {
    users(email: $email) {
      id
      name
      email
      reports {
        id
        name
        email
        profile {
          title
          photoUrl
        }
      }
      peers {
        id
        name
        email
        profile {
          title
          photoUrl
        }
      }
      profile {
        handle
        department
        dobMonth
        dobDay
        title
        dateStarted
        photoUrl
        primaryPhone
        office {
          id
          name
          location
          lat
          lng
        }
        reportsTo {
          id
          name
          profile {
            title
            photoUrl
          }
        }
      }
    }
  }
`;
