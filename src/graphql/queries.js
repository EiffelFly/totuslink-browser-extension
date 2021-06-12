/* eslint-disable */

export const getUserHolograms = /* GraphQL */ `
  query GetUser($id: ID!){
    getUser(id: $id){
      id
      username
      hologram {
        items {
          id
          title
          createdBy {
            username
          }
        }
      }
      avatar {
        region
        bucket
        key
      }
      email
    }
  }
`

export const hologramNodeByCreatedById = /* GraphQL */ `
  query HologramNodeByCreatedById(
    $hologramID: ID
    $createdByID: ModelIDKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelHologramNodeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    hologramNodeByCreatedByID(
      hologramID: $hologramID
      createdByID: $createdByID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        hologramID
        nodeID
        accessPolicy
        weightID
        createdByID
        createdAt
        updatedAt
        node {
          baseType
          id
          url
          title
        }
        weight {
          id
          calculation
          value
          version
        }
        owner
      }
      nextToken
    }
  }
`;

export const buildNode = /* GraphQL */ `
  query BuildNode($url: String, $title: String, $hologramID: String) {
    buildNode(url: $url, title: $title, hologramID: $hologramID)
  }
`;