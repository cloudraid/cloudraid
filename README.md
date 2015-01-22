# CloudRaid

CloudRaid is a simple RAID-like solution for distributed cloud storages. 

## Installation Instructions
* Use npm to download all required dependencies by executing `npm install` in the project directory
* Start the `cloudraid` binary in the `bin` directory
* Open `http://localhost:3000`in your browser
* Log in with the default credentials `admin`/`admin`

## How to set up Cloud Storage Providers
* Log in with any admin account and navigate to the settings page
* Settings can be entered as a JSON dictionary, consisting of the RAID mode and the list of storage provider accounts

* Example:

        {"type": "<RAIDMODE>", "providers": [    
          {"type": "box", "accessToken": "", "refreshToken": "", "clientID": "", "clientSecret": ""},
          {"type": "amazon", "key": "", "secret": ""},
          {"type": "dropbox", "key": "", "secret": "", "token": ""}
        ]}
        
    * Replace `<RAIDMODE>` with either `raid1` or `raid5`. Enter the storage provider credentials as required.