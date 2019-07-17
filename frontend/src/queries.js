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
    $humansOnly: Boolean
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
      humansOnly: $humansOnly
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
      photo {
        data
        width
        height
        mimeType
      }
      profile {
        title
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
    users(email: $email, humansOnly: false) {
      id
      name
      email
      reports {
        id
        name
        email
        photo {
          data
          width
          height
          mimeType
        }
        profile {
          title
        }
      }
      peers {
        id
        name
        email
        photo {
          data
          width
          height
          mimeType
        }
        profile {
          title
        }
      }
      photo {
        data
        width
        height
        mimeType
      }
      profile {
        handle
        department
        dobMonth
        dobDay
        title
        dateStarted
        primaryPhone
        isHuman
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
          email
          photo {
            data
            width
            height
            mimeType
          }
          profile {
            title
          }
        }
      }
    }
  }
`;
