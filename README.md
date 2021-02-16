# MGCI Announcements

## About 
Digital announcements system written Google Apps Script during 12th grade. The program allows users to remotely post announcements at any time.

This is currently in use by Marc Garneau C.I., where paper announcements have been phased out. Other TDSB schools are currently in talks to trial the proram. If you're interested, reach out to me at tshahjah@uwaterloo.ca

![Hype poster. Creds: Probably Hannah Nie](/images/branding.png)

## Developer Guide

### Updating
Just updating the source code is usually not enough. In order to generate new triggers, you have to look at the Trigger Dashboard (->Edit->Current Project’s Triggers).

Since the script is deployed as a web app [1], the source code must be deployed before an end user is affected. The script can only be run via verified user accounts.

![Fig 1: Deployment configuration](/images/deployment.png)



### Version Control
If you want to make non-trivial changes to the codebase, it’s recommended to develop locally using clasp. (https://developers.google.com/apps-script/guides/clasp) With clasp, you can upload and deploy changes to the source using the command line, making for a superior development experience compared to the online GAS interface. 

## Improvements

### Permissions
The script and the daily triggers are tied to tazikshahjahan@gmail.com. Ideally, this would be mgci.announcements@gmail.com. Permission to execute the script is dependent on ownership of a number of associated Sheets, Slides and Forms. Ideally, these would all be in a single Drive folder, which can then be transferred as required. Currently, certain Drive documents (the Forms) must be tied to a TDSB account for automatic domain validation. This validation should be account-agnostic.
