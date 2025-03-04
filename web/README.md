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

