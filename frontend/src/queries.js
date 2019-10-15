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
  query listDepartments(
    $id: UUID
    $query: String
    $peopleOnly: Boolean
    $rootOnly: Boolean
  ) {
    departments(id: $id, query: $query, peopleOnly: $peopleOnly, rootOnly: $rootOnly) {
      id
      name
      numPeople
      costCenter
    }
  }
`;

export const GET_DEPARTMENT_QUERY = gql`
  query getDepartmentForUpdate($id: UUID!) {
    departments(id: $id) {
      id
      name
      costCenter
      tree {
        costCenter
        name
      }
      parent {
        id
        name
        costCenter
      }
    }
  }
`;

export const SELECT_DEPARTMENT_QUERY = gql`
  query listDepartmentsForSelect($query: String!) {
    departments(query: $query, limit: 10) {
      id
      name
      costCenter
      tree {
        costCenter
        name
      }
    }
  }
`;

export const CREATE_DEPARTMENT_MUTATION = gql`
  mutation createDepartment($data: DepartmentInput!) {
    createDepartment(data: $data) {
      ok
      errors
    }
  }
`;

export const UPDATE_DEPARTMENT_MUTATION = gql`
  mutation updateDepartment($department: UUID!, $data: DepartmentInput!) {
    updateDepartment(department: $department, data: $data) {
      ok
      errors
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
    $department: UUID
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
      department {
        id
        name
      }
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
      department {
        id
        name
        tree {
          id
          name
        }
      }
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

export const SELECT_PEOPLE_QUERY = gql`
  query listPeopleForSelect($query: String!) {
    users(humansOnly: true, query: $query, limit: 10) {
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
`;
