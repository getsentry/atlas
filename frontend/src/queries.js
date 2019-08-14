import gql from "graphql-tag";

export const LIST_EMPLOYEE_TYPES_QUERY = gql`
  query listEmployeeTypes($name: String, $query: String) {
    employeeTypes(name: $name, query: $query) {
      id
      name
      numPeople
    }
  }
`;

export const LIST_OFFICES_QUERY = gql`
  query listOffices {
    offices {
      id
      externalId
      name
      location
      locality
      administrativeArea
      postalCode
      regionCode
      lat
      lng
      numPeople
    }
  }
`;

export const GET_OFFICE_QUERY = gql`
  query getOffice($id: UUID, $externalId: String) {
    offices(id: $id, externalId: $externalId) {
      id
      name
      externalId
      description
      location
      locality
      administrativeArea
      postalCode
      regionCode
      lat
      lng
      numPeople
    }
  }
`;

export const LIST_DEPARTMENTS_QUERY = gql`
  query listDepartments($name: String, $query: String) {
    departments(name: $name, query: $query) {
      name
      numPeople
    }
  }
`;

export const LIST_PEOPLE_QUERY = gql`
  query listPeople(
    $office: UUID
    $humansOnly: Boolean
    $employeeType: String
    $dateStartedBefore: Date
    $dateStartedAfter: Date
    $anniversaryBefore: Date
    $anniversaryAfter: Date
    $birthdayBefore: Date
    $birthdayAfter: Date
    $query: String
    $department: String
    $includeSelf: Boolean
    $orderBy: UserOrderBy
    $offset: Int
    $limit: Int
  ) {
    users(
      office: $office
      humansOnly: $humansOnly
      employeeType: $employeeType
      dateStartedBefore: $dateStartedBefore
      dateStartedAfter: $dateStartedAfter
      anniversaryBefore: $anniversaryBefore
      anniversaryAfter: $anniversaryAfter
      birthdayBefore: $birthdayBefore
      birthdayAfter: $birthdayAfter
      query: $query
      department: $department
      includeSelf: $includeSelf
      orderBy: $orderBy
      offset: $offset
      limit: $limit
    ) {
      id
      name
      email
      department
      isHuman
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
      bio
      department
      dobMonth
      dobDay
      title
      dateStarted
      primaryPhone
      isHuman
      employeeType {
        id
        name
      }
      tenurePercent
      pronouns
      schedule {
        sunday
        monday
        tuesday
        wednesday
        thursday
        friday
        saturday
      }
      social {
        linkedin
        github
        twitter
      }
      gamerTags {
        steam
        xbox
        playstation
        nintendo
      }
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
      referredBy {
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
