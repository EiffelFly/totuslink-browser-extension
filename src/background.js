
import {
  CognitoIdToken, 
  CognitoAccessToken, 
  CognitoRefreshToken, 
  CognitoUserSession,
  CognitoUser,
  CognitoUserPool
} from "amazon-cognito-identity-js";
import config from "../config"
import AWSAppSyncClient,  { AUTH_TYPE } from 'aws-appsync'
import { getUserHolograms as getUserHologramsQuery } from "./graphql/queries.js"
import gql from 'graphql-tag';
import { buildNode } from "./graphql/queries.js"

let cognitoUser;
let client;
let userID;
let holograms = []
let hologramNodes = [] // eslint-disable-line no-unused-vars
let currentSessionHologramNodes = []
let currentUserData; // eslint-disable-line no-unused-vars

// Construct Auth object
browser.runtime.onMessage.addListener( async function(message) {
  if ( message.action === "constructAuth" ){
    console.log("constructAuth begin")
    if (cognitoUser){
      cognitoUser.getSession((err, session) => {
        if (session){
          browser.runtime.sendMessage({"action":"constructAuth", "status":"Success"});
        } else {
          browser.runtime.sendMessage({"action":"constructAuth", "status":"Failed"});
          cognitoUser = null;
        }
      })
      return;
    }
    console.log('getToken')
    try {
      const idToken = await browser.cookies.get({"url":config.cookie_page, "name":"idToken"})
      const refreshToken = await browser.cookies.get({"url":config.cookie_page, "name":"refreshToken"})
      const clockDrift = await browser.cookies.get({"url":config.cookie_page, "name":"clockDrift"})
      const accessToken = await browser.cookies.get({"url":config.cookie_page, "name":"accessToken"})
      let authIdToken = new CognitoIdToken({
        IdToken: idToken.value
      });

      userID = authIdToken.payload['sub']    
      let authAccessToken = new CognitoAccessToken({
        AccessToken: accessToken.value
      });
    
      let authRefreshToken = new CognitoRefreshToken({
        RefreshToken: refreshToken.value
      });
    
      const sessionData = {
        IdToken: authIdToken,
        AccessToken: authAccessToken,
        RefreshToken: authRefreshToken,
        ClockDrift: clockDrift.value
      }
    
      // Create the session 
      let userSession  = new CognitoUserSession(sessionData);
      const userData = {
        Username: userSession.getIdToken().payload['cognito:username'],
        Pool: new CognitoUserPool({UserPoolId: config.aws_user_pools_id, ClientId: config.aws_user_pools_web_client_id})
      }
    
      // Make a new cognito user
      cognitoUser = new CognitoUser(userData);
    
      // Attach the session to the user
      cognitoUser.setSignInUserSession(userSession);
      cognitoUser.getSession((err, session) => {
        if (session){
          console.log(session)
          browser.runtime.sendMessage({"action":"constructAuth", "status":"Success"});
        } else {
          console.log(err)
          browser.runtime.sendMessage({"action":"constructAuth", "status":"Failed"});
        }
      })
    } catch(err){
      console.log(err)
      browser.runtime.sendMessage({"action":"constructAuth", "status":"Failed"});
    }
  }
});

//Construct API client
browser.runtime.onMessage.addListener( (message) => {
  if ( message.action == "constructClient" ){
    if ( client ){
      browser.runtime.sendMessage({ "action":"constructClient", "status":"Success" })
      return;
    }
    try {
      client = new AWSAppSyncClient({
        url: config.aws_appsync_graphqlEndpoint,
        region: config.aws_appsync_region,
        auth: {
          type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
          jwtToken: cognitoUser.signInUserSession.accessToken.jwtToken
        },
        disableOffline: true
      });
      browser.runtime.sendMessage({ "action":"constructClient", "status":"Success" })
    } catch(err){
      browser.runtime.sendMessage({ "action":"constructClient", "status":"Failed" })
    }
  }
});

// Get user holograms
browser.runtime.onMessage.addListener( async (message) => {
  if ( message.action === "getUserData" ){
    const input = {
      "id": userID
    }
    try {
      const result = await client.query({
        query: gql(getUserHologramsQuery),
        variables:input,
        fetchPolicy: "network-only"
      })
      console.log(result)
      browser.runtime.sendMessage({ "action":"getUserData", "status":"Success", "data": result.data.getUser })
      holograms.push(...result.data.getUser.hologram.items)
      currentUserData = result.data.getUser;
    } catch(err){
      if (!cognitoUser){
        browser.runtime.sendMessage({ "action":"getUserData", "status":"Failed" })
        return;
      }
      try {
        const currentSession = cognitoUser.signInUserSession;
        cognitoUser.refreshSession(currentSession.refreshToken, (err, session) => {
          if (session){
            browser.runtime.sendMessage({"action":"constructAuth", "status":"Success"});
          }
        });
      } catch(err){
        browser.runtime.sendMessage({ "action":"getUserData", "status":"Failed" })
      }
    }
  }
});

// Reset token if it had been expired
browser.runtime.onMessage.addListener( (message) => {
  if ( message.action === "resetUserToken" ){
    cognitoUser = null;
  }
})

// TODO: The way we query hologramNodes is too slow
// We need to speed it up, before that we just don't get these data
// But we will store the hologramNodes user add during this session!

browser.runtime.onMessage.addListener( async (message) => {
  if ( message.action === "getHologramNodes" ){
    if ( holograms.length === 0 ){
      return;
    }
    browser.runtime.sendMessage({ "action":"getHologramNodes", "status":"Success", "data":currentSessionHologramNodes })

    /*

    if ( hologramNodes.length !== 0 ){
      browser.runtime.sendMessage({ "action":"getHologramNodes", "status":"Success", "data":hologramNodes })
      return;
    }
    
    for ( const hologram of holograms ){
      try {
        const result = await listHologramNodes(client, hologram.id, null, 100);
        if ( typeof result === "object" ){
          hologramNodes.push(...result)
        }
      } catch(err){
        console.error(err)
        browser.runtime.sendMessage({ "action":"getHologramNodes", "status":"Failed" })
      }
    }
    browser.runtime.sendMessage({ "action":"getHologramNodes", "status":"Success", "data":hologramNodes })
    */
  }
})



browser.runtime.onMessage.addListener( async (message) => {
  if ( message.action === "upload" ){
    const url = message.data.url;
    const title = message.data.title;
    const targetHologramID = message.data.hologramID;
    console.log(url, targetHologramID, title)
    const input = {
      url: url,
      title: title,
      hologramID: targetHologramID
    }
    try {
      client.query({
        query: gql(buildNode),
        variables:input,
        fetchPolicy: "network-only"
      })

      const data = {
        "hologramID": targetHologramID,
        "node": {
          "url": url
        }
      }

      currentSessionHologramNodes.splice(0, 0, data);
      browser.runtime.sendMessage({ "action":"upload", "status":"Success" })
    } catch(err){
      browser.runtime.sendMessage({ "action":"upload", "status":"Failed", "error":err })
    }
  }
})


//////////// Chrome commands listener ///////////////

chrome.commands.onCommand.addListener(function(command) {
  console.log('Command:', command);
});

//////////// Helper function ///////////////

const getUrlObject = function(url){ // eslint-disable-line no-unused-vars
  try {
    const result = new URL(url)
    return result
  } catch(err) {
    return 'invalidUrl'
  }
}
