![Radius Rock](./assets/radiusrock-banner.png)

# RADIUS Authentication with Rock RMS

RadiusRock is a Node.js RADIUS server for [Rock RMS](http://rockrms.com) built with the [node-radius](https://github.com/retailnext/node-radius/) library. RadiusRock can be deployed as a authentication server for any RADIUS based Wi-Fi captive portal.  

Tested With:

- Ruckus Wireless Zonedirector
- Meraki MX / MR

### Setup

RadiusRock requires node.js v0.8.0. To set up the project, first download it with Git:

```bash
git clone https://github.com/northpointe/radiusrock projectname
```

Then open the folder in your command line, and install the needed dependencies:

```bash
cd projectname
npm install

npm start # run locally
```
