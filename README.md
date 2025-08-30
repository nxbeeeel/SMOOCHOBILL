# Smoocho POS System

A comprehensive Point of Sale system built with React, Node.js, and PostgreSQL.

## Features

- **Inventory Management**: Track stock levels, set alerts, manage suppliers
- **Sales & Billing**: Process transactions, generate invoices, handle returns
- **Customer Management**: Store customer information and purchase history
- **Reporting & Analytics**: Sales reports, inventory reports, financial insights
- **Multi-user Support**: Role-based access control
- **Real-time Updates**: Live inventory and sales synchronization

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Real-time**: Socket.io
- **Deployment**: Vercel (Frontend) + Railway (Backend)

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nxbeeeel/SMOOCHOBILL.git
   cd SMOOCHOBILL
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend (.env)
   DATABASE_URL="postgresql://username:password@localhost:5432/smoocho_pos"
   JWT_SECRET="your-secret-key"
   PORT=5000
   
   # Frontend (.env)
   REACT_APP_API_URL="http://localhost:5000"
   REACT_APP_WS_URL="ws://localhost:5000"
   ```

4. **Set up the database**
   ```bash
   cd server
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start the development servers**
   ```bash
   # Start backend (from server directory)
   npm run dev
   
   # Start frontend (from client directory, in new terminal)
   npm start
   ```

## Default Login

- **Username**: `admin`
- **Password**: `admin123`

## Production Deployment

### Frontend (Vercel)
- Automatically deploys from GitHub main branch
- Environment variables configured in vercel.json
- Builds from client/build directory

### Backend (Railway)
- Automatically deploys from GitHub main branch
- Uses Nixpacks for Node.js deployment
- PostgreSQL database hosted on Railway

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Inventory
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create new inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create new sale
- `GET /api/sales/:id` - Get specific sale

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

**Last updated**: 2025-08-30 13:15 UTC - Force deployment trigger
