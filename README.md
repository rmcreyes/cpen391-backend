# cpen391-backend

The backend to our CPEN 391 project

![](https://github.com/rmcreyes/cpen391-backend/actions/workflows/node.js.yml/badge.svg)

# API Documentation

https://www.postman.com/steveny9911/workspace/cpen-391-backend/overview

# Flow Diagram

## Parking

![](static/parking_auto.drawio.png)

## Leaving

![](static/leaving.drawio.png)

# Deploy

```sh
git checkout main
git push heroku main
```

# Set-up

**Requirement**

- NodeJS 14
- MongoDB 4

**Install**

```sh
npm install
npm ci
mongod
```

**Environment Variables**

```sh
cp .env.sample .env
```

# Running

```sh
npm start                   # start server (port 80)
npm run dev                 # run development server (port 8080)
npm test                    # run all tests (also generate coverage)
```
