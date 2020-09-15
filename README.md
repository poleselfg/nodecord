# NodeCord

A Discord webscraper based on NodeJS.

## Configurations to Run Nodecord

### To run Nodecord you have to create  two configuration files:

**A JSON file named config.json in /src/config with the following structure:**

```json
{
    "user": "",
    "password": "",
    "server" : ["700775674943635487", "109148828447289344", "388752326304727040", "700775674943635487", "700775674943635487","580895061244510208"],
    "channel": ["700877488590422096", "266452244294139904", "575695445012250644", "700775675576975492", "700792547450159145","616438719360270338"],
    "type" : "ceragon_discord"
}
```

**A environment file named .env with the next structure:**

ENVIRONMENT=production

PORT_SERVER=3000

PORT_MONGO=27017

URL_MONGO=mongodb://localhost:27017/nodecord

URL_SENTI_API=THE_SENTI:API_URL

TOKEN_SENTI_API=THE_SENTI_API_TOKEN