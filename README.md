# CloudRaid

CloudRaid is a simple RAID-like solution for distributed cloud storages. 

## Installation Instructions
* Use npm to download all required dependencies by executing `npm install` in the project directory
* Start the `cloudraid` binary in the `bin` directory
* Open `http://localhost:3000`in your browser
* Log in with the default credentials `admin`/`admin`

## How to set up Cloud Storage Providers
* Log in with any admin account and navigate to the settings page
* Credentials can be entered as a JSON dictionary. It needs to include both app credentials and user access tokens.

* Example:

        {"providers": [    
          {"type": "box", "accessToken": "", "refreshToken": "", "clientID": "", "clientSecret": ""},
          {"type": "amazon", "key": "", "secret": ""},
          {"type": "dropbox", "key": "", "secret": "", "token": ""}
        ]}
