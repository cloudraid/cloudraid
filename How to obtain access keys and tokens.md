The README in the Git repository describes the process of setting up and starting the application. This document serves to describe how to obtain the neccessary keys and tokens for the used APIs. You will need the following credentials:  
**Box:** Client ID, client secret, access token, refresh token  
**Dropbox:** App key, app secret, access token  
**Amazon:** Access key ID, secret access key  

Due to a lack of support for OAuth, there is no special workflow for Amazon. The access key ID and secret access key are all that's needed.


## OAuth Workflow
In order to access the data of Box and Dropbox users, developers need to register their applications with them. By using OAuth, clients will have to explicitly grant apps access to their accounts.  
When registering an application, Box/Dropbox provide a pair of keys, commonly referred to as app key and app secret. In order to authorize their apps, developers have to redirect users to the websites of Box/Dropbox and supply the key pair. After the client logs in with their account, a token is returned to the application which grants it access to the client's account.


## Registering an application with Dropbox
1. Create an account at Dropbox
1. Visit the [App Console](https://www.dropbox.com/developers/apps)
1. Click "Create app." On the next screen, select "Dropbox API app"
1. Choose the permission type and app title at your discretion
1. After confirming the details, you will be redirected to the app details screen, where you will find your **app key** and **app secret**.


## Authorizing the Dropbox app
See [this link](https://www.dropbox.com/developers/blog/45/using-oauth-20-with-the-core-api). Open the authorization page of Dropbox and include the app key. After logging in and granting the app access, you will be redirected to the site specified in the previous step (e.g. localhost). Take the authorization code from the address bar of your browser and call the token endpoint via curl, as described in step 2. The response will contain the **access token**.


## Registering an application with Box
1. Create an account at Box
1. Visit [the developer portal](https://app.box.com/developers/services)
1. Choose an title for the app and select "Box Content" as the type
1. After confirming, select "Configure app". You will find the **client id** and **client secret** in the following screen.


## Authorizing the Box app
As described [here](https://developers.box.com/oauth/), the workflow to authorize a Box app to access an account is equivalent to Dropbox's. After logging in at Box after having provided the client id, the URL you're redirected to contains a code which can then be used in a curl call to obtain a pair of **access token** and **refresh token**.