import { hologramNodeByCreatedById as hologramNodeByCreatedByIdQuery } from "./queries"
import gql from 'graphql-tag';


/**
 * 
 * @param {object} client appsync client object
 * @param {id} hologramID 
 * @param {string} nextToken listHologramNodes query nextToken
 * @param {int} limit default = 100
 * @returns {objecy} hologramNodes
 */

export const listHologramNodes = async (client, hologramID, nextToken, limit) => {
  let result = [];
  const input = {
    "nextToken": nextToken,
    "hologramID": hologramID,
    "limit": limit
  }

  try {
    const queryResult = await client.query({
      query: gql(hologramNodeByCreatedByIdQuery),
      variables:input,
      fetchPolicy: "network-only"
    })
    result.push(...queryResult.data.hologramNodeByCreatedByID.items)
    
    if ( queryResult.data.hologramNodeByCreatedByID.nextToken ){
      const recursiveResult = await listHologramNodes(client, hologramID, queryResult.data.hologramNodeByCreatedByID.nextToken, limit)
      result.push(...recursiveResult)
      console.log(recursiveResult)
    }

    return Promise.resolve(result)
  } catch(err){
    return Promise.reject(err)
  }
}
