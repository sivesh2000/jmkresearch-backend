# JMK Next Backend

Backend API for JMK Next, built with Node.js, Express, and MongoDB.

## Getting Started

### Installation

Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd JMKNextBackend
npm install
```

## Features

- MongoDB with Mongoose ODM
- JWT authentication and authorization
- Request validation with Joi
- Logging with Winston and Morgan
- Centralized error handling
- API documentation with Swagger
- Process management with PM2
- Environment variable management with dotenv
- Security headers with Helmet
- Request sanitization and rate limiting
- CORS and gzip compression
- Docker support
- Linting with ESLint and Prettier
- Git hooks with Husky and lint-staged
- Unit and integration testing with Jest

## Commands

Start in development mode:

```bash
npm run dev
```

Start in production mode (uses PM2):

```bash
npm start
```

Run all tests:

```bash
npm test
```

Lint and fix:

```bash
npm run lint
npm run lint:fix
```

Format and fix:

```bash
npm run prettier
npm run prettier:fix
```

Docker (development):

```bash
npm run docker:dev
```

Docker (production):

```bash
npm run docker:prod
```

### Testing

Run all tests:

```bash
npm test
```

## Environment Variables

Copy `.env.example` to `.env` and update as needed. Example:

```env
PORT=3000
MONGODB_URL=mongodb://127.0.0.1:27017/JMKNext
JWT_SECRET=your_jwt_secret
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30
SMTP_HOST=email-server
SMTP_PORT=587
SMTP_USERNAME=email-server-username
SMTP_PASSWORD=email-server-password
EMAIL_FROM=support@yourapp.com
```

## API Documentation

API docs are available via Swagger after running the server:

```
http://localhost:3000/v1/docs
```

### Linting & Formatting

Check lint errors:

```bash
npm run lint
```

Fix lint errors:

```bash
npm run lint:fix
```

Check formatting:

```bash
npm run prettier
```

Fix formatting:

```bash
npm run prettier:fix
```

### Docker

Development:

```bash
npm run docker:dev
```

Production:

```bash
npm run docker:prod
```

## Project Structure

```
src/
  config/         # Configuration and environment variables
  controllers/    # Route controllers
  docs/           # API docs (Swagger)
  middlewares/    # Express middlewares
  models/         # Mongoose models
  routes/         # API routes
  services/       # Business logic
  utils/          # Utility functions
  validations/    # Joi validation schemas
  app.js          # Express app
  index.js        # App entry
```
