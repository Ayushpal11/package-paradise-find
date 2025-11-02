# Travel Packages Backend API

Backend API for the travel package comparison engine.

## Setup Instructions

### 1. Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (local or hosted on Neon/Supabase)
- npm or yarn

### 2. Database Setup

#### Option A: Using Neon (Free PostgreSQL Hosting)

1. Go to [Neon](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://user:password@host/database`)

#### Option B: Using Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:
   ```bash
   createdb travel_packages
   ```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Environment Configuration

Create a `.env` file in the `backend` folder:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL=postgresql://username:password@host:5432/travel_packages
PORT=3001
NODE_ENV=development
CORS_ORIGINS=http://localhost:8080,http://localhost:5173
```

### 5. Initialize Database

The database tables will be created automatically when you start the server. To seed with sample data:

```bash
npm run seed
```

### 6. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Packages

- `GET /api/packages` - Search packages with filters
  - Query params: `destination`, `origin`, `priceMin`, `priceMax`, `hotelStars`, `meals`, `transfers`, `refundable`, `nights`, `sortBy`
  
- `GET /api/packages/:id` - Get single package details

- `GET /api/packages/vendor/:vendorId` - Get packages by vendor

### Enquiries

- `POST /api/enquiries` - Submit new enquiry
  - Body: `{ packageId, name, email, phone, travellers, message }`

- `GET /api/enquiries` - Get all enquiries (admin)

- `GET /api/enquiries/:id` - Get single enquiry (admin)

### Health Check

- `GET /health` - Health check endpoint

## Database Schema

### Vendors Table
- `id` - Primary key
- `name` - Vendor name (unique)
- `type` - 'OTA' or 'Local'
- `contact_email`, `contact_phone`
- `website_url`
- `rating`

### Packages Table
- `id` - Primary key
- `title`, `destination`, `origin`
- `duration`, `price`, `currency`
- `vendor_id` - Foreign key to vendors
- `rating`, `hotel_stars`
- Inclusions: `includes_flights`, `includes_hotels`, `includes_transfers`, `includes_meals`, `includes_sightseeing`
- `image_url`, `images` (array)
- `highlights` (array), `itinerary` (JSONB)
- `hotel_info` (JSONB), `flight_info` (JSONB)
- `refundable`

### Enquiries Table
- `id` - Primary key
- `package_id` - Foreign key to packages
- `name`, `email`, `phone`
- `travellers`, `message`
- `status` - 'pending', 'contacted', 'completed', 'cancelled'
- `created_at`

## Deploying to Render

1. Create a new account on [Render](https://render.com)
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NODE_ENV=production`
   - `CORS_ORIGINS` - Your frontend URL
7. Deploy!

## Testing

You can test the API using curl or Postman:

```bash
# Health check
curl http://localhost:3001/health

# Search packages
curl "http://localhost:3001/api/packages?destination=Bali"

# Get package details
curl http://localhost:3001/api/packages/1
```

## Troubleshooting

### Database connection issues
- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running (if using local DB)
- Check firewall settings (if using hosted DB)

### CORS errors
- Update `CORS_ORIGINS` in `.env` to include your frontend URL
- Ensure the frontend is making requests to the correct backend URL

### Port already in use
- Change `PORT` in `.env` to a different port
- Or stop the process using port 3001

