import gql from "graphql-tag";

export const GET_OFFICE_QUERY = gql`
  query getOffice($id: UUID, $externalId: String) {
    offices(id: $id, externalId: $externalId) {
      id
      name
      externalId
      description
      location
      postalCode
      regionCode
      lat
      lng
      numPeople
    }
  }
`;

export const LIST_PEOPLE_QUERY = gql`
  query listPeople(
    $office: UUID
    $humansOnly: Boolean
    $dateStartedBefore: Date
    $dateStartedAfter: Date
    $anniversaryBefore: Date
    $anniversaryAfter: Date
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
      anniversaryBefore: $anniversaryBefore
      anniversaryAfter: $anniversaryAfter
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
      title
      dobMonth
      dobDay
      dateStarted
      photo {
        data
        width
        height
        mimeType
      }
      reportsTo {
        id
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
      handle
      department
      dobMonth
      dobDay
      title
      dateStarted
      primaryPhone
      isHuman
      reports {
        id
        name
        email
        title
        photo {
          data
          width
          height
          mimeType
        }
      }
      peers {
        id
        name
        email
        title
        photo {
          data
          width
          height
          mimeType
        }
      }
      photo {
        data
        width
        height
        mimeType
      }
      office {
        id
        externalId
        name
        location
        lat
        lng
      }
      reportsTo {
        id
        name
        email
        title
        photo {
          data
          width
          height
          mimeType
        }
      }
    }
  }
`;
