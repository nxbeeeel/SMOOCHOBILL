# Smoocho POS + Inventory Management System

A full-featured Point of Sale and Inventory Management System designed specifically for Smoocho Dessert Shop. Built for tablet use with offline capabilities, thermal printer support, and integrations with delivery platforms.

## 🚀 Features

### Core POS Features
- **Touch-optimized billing interface** with large buttons and easy navigation
- **Multiple order types**: Dine-in, Takeaway, Zomato, Swiggy
- **Payment processing**: Cash, Card (Paytm integration), Digital payments
- **Bill management**: Generate, edit, print, and reprint bills
- **Discount system**: Percentage and flat discounts
- **Real-time inventory deduction** based on sales

### Inventory Management
- **Stock tracking** with automatic deduction
- **Low stock alerts** with customizable thresholds
- **Expiry date management**
- **Recipe-based inventory** (ingredients per product)
- **Reorder reminders** via Email and WhatsApp

### Integrations
- **Zomato & Swiggy** order synchronization
- **Paytm card machine** integration
- **Thermal printer** support
- **WhatsApp API** for alerts
- **Email notifications** via SMTP

### Offline Capabilities
- **Full offline operation** for billing and inventory
- **Automatic sync** when internet connection returns
- **Local database** (SQLite) for offline data storage
- **Conflict resolution** for data synchronization

### Reporting & Analytics
- **Daily sales reports** with print/PDF export
- **Monthly summaries** with profit analysis
- **Payment method filtering**
- **Stock usage reports**
- **Real-time dashboard**

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite (local) + Supabase (cloud)
- **Real-time**: WebSocket + Socket.io
- **Offline**: Service Workers + IndexedDB
- **PWA**: Progressive Web App capabilities
- **Printing**: Thermal printer APIs

## 📱 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Android tablet or device for testing

### Quick Start

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd smoocho-pos
npm run install-all
```

2. **Environment Setup:**
```bash
# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. **Configure your settings:**
   - Update database credentials
   - Add API keys for integrations
   - Configure printer settings
   - Set up WhatsApp and email alerts

4. **Start development servers:**
```bash
npm run dev
```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📋 System Requirements

### Hardware
- **Android tablet** (recommended: 10" or larger)
- **Thermal printer** (80mm or 58mm)
- **Paytm card machine** (for card payments)
- **Stable internet connection** (for cloud sync)

### Software
- **Android 8.0+** or **Chrome browser**
- **PWA support** for offline functionality
- **USB/Bluetooth** for printer connectivity

## 🔧 Configuration

### Printer Setup
1. Connect thermal printer via USB/Bluetooth
2. Configure printer settings in admin panel
3. Test print functionality

### Payment Integration
1. Configure Paytm merchant credentials
2. Test card payment flow
3. Set up webhook endpoints

### Delivery Platform Integration
1. Add Zomato/Swiggy API credentials
2. Configure order sync intervals
3. Test order import functionality

## 📊 Database Schema

### Core Tables
- `users` - User accounts and roles
- `products` - Menu items and pricing
- `categories` - Product categories
- `orders` - Sales orders and bills
- `order_items` - Items in each order
- `inventory` - Stock items and quantities
- `transactions` - Payment transactions
- `integrations` - External platform data

## 🔐 Security Features

- **JWT authentication** for secure login
- **Role-based access control** (Admin, Cashier)
- **Data encryption** for sensitive information
- **Audit logging** for all transactions
- **Secure API endpoints** with rate limiting

## 📱 PWA Features

- **Offline-first** architecture
- **App-like experience** on tablets
- **Push notifications** for alerts
- **Background sync** for data synchronization
- **Install prompt** for easy app installation

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
docker-compose up -d
```

### Manual Deployment
1. Build the client application
2. Set up production environment variables
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Configure database backups

## 📞 Support

For technical support or feature requests, please contact the development team.

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for Smoocho Dessert Shop**
