# Star Kitten Web

Project created with [Brisa](https://github.com/brisa-build/brisa).

## Getting Started

### Installation

```bash
bun install
```

### Link the Library

`star-kitten-lib` has not been published, so link to it locally before running this web project.

```bash
cd star-kitten-lib
bun link
cd ../web
bun link star-kitten-lib
```

### Download static eve reference data & Hoboleaks archive from [EVE Ref](https://everef.net/).

```bash
cd star-kitten-lib
bun get-data
```

### Initialize the sqlite database

```bash
cd star-kitten-lib
bun generate-migrations
bun migrate
```
Drizzle's migrations seems to fail on the first try sometimes, so just grab the .sql from the generation and run those against the kitten.db file to create the tables & indexes.

## Environment Variables

Create a .env file in the root directory with the following values:

```yaml
#General
BASE_URL=http://localhost:3000
DEBUG=true
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug


# EVE - https://developers.eveonline.com/applications
EVE_CLIENT_ID=YOUR_EVE_CLIENT_ID
EVE_CLIENT_SECRET=YOUR_EVE_SECRET
EVE_CALLBACK_URL=http://localhost:3000/auth/callback
ESI_USER_AGENT=ADD_YOUR_USER_AGENT_INFO_HERE

# For using Janice's Appraisal API
JANICE_KEY=XXX

# For using Perplexities AI API
PERPLEXITY_API_KEY=XXX
```

### Development

```bash
bun dev
```

### Build

```bash
bun build
```

### Start

```bash
bun start
```

