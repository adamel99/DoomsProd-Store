# DoomsProd Beat Store

DoomsProd Beat Store is a full-stack ecommerce platform for selling digital music products: beats, loop kits, drum kits, and audio plugins. It combines a polished React storefront with an Express/Sequelize API that handles authentication, product management, carts, checkout, Stripe payments, protected downloads, and admin order tools.

This project is both a creator storefront and a portfolio piece. It shows how I approach production-minded web applications: secure checkout, role-based access, file validation, cloud storage, signed download links, transactional email, and a UI designed around the real workflow of browsing, licensing, purchasing, and receiving digital audio assets.

## What This App Does

- Lets customers browse beats, kits, and plugins from a responsive storefront.
- Supports beat licensing with separate license tiers and terms.
- Allows authenticated users to manage a cart and complete checkout.
- Integrates Stripe Checkout for paid orders.
- Supports free checkout for zero-dollar carts.
- Sends product delivery emails after successful purchases.
- Provides protected download pages backed by signed URLs.
- Gives admins tools to create, edit, and upload products.
- Gives admins an order dashboard with search, revenue stats, customer details, and receipt resend actions.
- Includes music metadata such as genre, BPM, key, artist tags, YouTube previews, and audio preview URLs.
- Includes plugin-specific storefront support for downloadable audio software.

## Tech Stack

**Frontend**

- React 18
- Redux, Redux Thunk, and React Redux
- React Router
- Material UI
- Framer Motion
- Stripe.js
- Axios
- React Easy Crop

**Backend**

- Node.js
- Express
- Sequelize
- SQLite for local development
- PostgreSQL for production
- JWT authentication with signed cookies
- CSRF protection
- Helmet, CORS, rate limiting, and request validation
- Stripe Checkout and Stripe webhooks
- AWS S3 uploads and signed download delivery
- Resend/Nodemailer email utilities

## Key Engineering Highlights

### Secure Ecommerce Flow

The backend creates orders from cart state, sends customers through Stripe Checkout, verifies Stripe webhook signatures, marks paid orders as completed, clears purchased cart items, and generates downloadable product delivery links. Webhook events are tracked so repeated Stripe events do not duplicate fulfillment work.

### Digital Product Delivery

Admin-uploaded files are validated before upload, stored in S3, and delivered to customers through protected API routes. Customers can only access downloads for their own completed orders, and download URLs are signed instead of exposing private storage objects directly.

### Role-Based Admin Features

The app separates customer behavior from admin behavior. Admin-only routes support product creation, product editing, file uploads, license management, order inspection, and receipt resending.

### Security-Conscious Backend

The API includes JWT auth restoration, CSRF protection, CORS allowlisting, Helmet headers, request validation, login attempt tracking, rate limits, and restricted download endpoints. Production config also supports PostgreSQL schemas and SSL database settings.

### Recruiter-Relevant Scope

This is not a static portfolio page. It is a working full-stack product with real-world concerns: payments, permissions, file storage, transactional email, schema migrations, seed data, frontend state management, protected routes, and production deployment configuration.

## Project Structure

```text
Adam-Portfolio/
├── backend/
│   ├── app.js                  # Express app, middleware, security, API mounting
│   ├── bin/www                 # Server startup and database authentication
│   ├── config/                 # Environment and database config
│   ├── db/
│   │   ├── migrations/         # Sequelize schema migrations
│   │   ├── models/             # Sequelize models and associations
│   │   └── seeders/            # Demo data
│   ├── routes/api/             # REST API routes
│   └── utils/                  # Auth, checkout, S3, email, validation helpers
├── frontend/
│   ├── public/                 # Static assets
│   └── src/
│       ├── components/         # Storefront, admin, checkout, account UI
│       ├── context/            # Modal and audio player contexts
│       ├── store/              # Redux state slices and API thunks
│       ├── App.js              # Client-side route map
│       └── theme.js            # Material UI theme customization
├── package.json                # Root scripts
└── README.md
```

## Main Routes

**Customer-facing**

- `/` - landing page and featured products
- `/products` - product catalog
- `/products/:productId` - product detail page
- `/plugins` - plugin-focused storefront
- `/licenses` - license options and terms
- `/cart` - cart review
- `/checkout` - checkout flow
- `/downloads/:sessionId` - protected download page
- `/account` - authenticated user account page
- `/about` - creator/developer background

**Admin**

- `/products/new` - create a product
- `/products/:productId/edit` - update a product
- `/admin/orders` - admin order dashboard

## Local Development

### Prerequisites

- Node.js 20 or newer
- npm
- SQLite for local development
- Stripe test keys for checkout testing
- AWS S3 credentials for upload and private download testing
- Resend or SMTP credentials for delivery email testing

### Install Dependencies

From the repository root:

```bash
npm install
```

Or install each app directly:

```bash
npm install --prefix backend
npm install --prefix frontend
```

### Database Setup

From `backend/`:

```bash
npx dotenv sequelize db:migrate
npx dotenv sequelize db:seed:all
```

The migrations support SQLite in development and PostgreSQL in production.

### Run the App

Start the backend:

```bash
npm run start --prefix backend
```

Start the frontend in a separate terminal:

```bash
npm run start --prefix frontend
```

The frontend runs at `http://localhost:3000` and proxies API requests to `http://localhost:8000`.

## API Areas

- `POST /api/users` - sign up
- `GET/POST/DELETE /api/session` - auth session management
- `GET/POST/PUT/DELETE /api/products` - product catalog and admin product management
- `GET/POST/PUT/DELETE /api/licenses` - license data and admin license management
- `/api/carts` and `/api/cart-items` - cart operations
- `/api/payment` - Stripe and free checkout creation
- `/api/webhook` - Stripe webhook fulfillment
- `/api/downloads/:orderOrSessionId` - protected signed download links
- `/api/orders` - customer and admin order operations

## Deployment Notes

The backend serves the React build in production. The root `render-postbuild` script builds the frontend, and the backend `build` script prepares the PostgreSQL schema when needed.

Production configuration supports:

- PostgreSQL database deployment
- SSL database options
- Static frontend serving from `frontend/build`
- CORS allowlisting for one or more frontend URLs
- Stripe webhook verification
- Private S3 downloads

## Future Improvements

- Add automated backend route tests for checkout and protected download behavior.
- Add frontend integration tests for cart, checkout, and admin product flows.
- Move demo credentials out of seeders and into documented local-only fixtures.
- Add screenshots or a short product walkthrough GIF for quicker recruiter review.
- Add CI for linting, tests, and migration checks.

## Why I Built It

I built this project to connect my background in music production, software engineering, and audio technology. It gave me a realistic way to practice the problems that matter in production apps: payments, files, permissions, secure delivery, admin tooling, and a frontend that feels like an actual product rather than a demo shell.
