# Smoocho POS - Client

This is the frontend React application for the Smoocho Point of Sale system.

## Features

- **Modern React 18** with TypeScript
- **Touch-optimized UI** for tablet use
- **PWA Support** for offline functionality
- **Real-time updates** via WebSocket
- **Responsive design** for all screen sizes
- **State management** with Zustand
- **Form handling** with React Hook Form
- **Styling** with Tailwind CSS

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- React Router DOM
- React Hook Form
- React Query
- Socket.io Client
- React Hot Toast
- Heroicons

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API and external services
├── store/              # Zustand state stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles and CSS
```

## Key Components

- **Layout**: Main application layout with navigation
- **LoginPage**: Authentication interface
- **DashboardPage**: Overview and statistics
- **POSPage**: Point of sale interface (coming next)
- **LoadingSpinner**: Reusable loading component
- **OfflineIndicator**: Shows offline status

## State Management

The app uses Zustand for state management with the following stores:

- **authStore**: User authentication and session
- **offlineStore**: Offline/online status and sync

## Offline Support

The application includes offline functionality:

- IndexedDB for local data storage
- Service Worker for caching
- Automatic sync when back online
- Offline indicator in UI

## Menu Integration

The system is pre-configured with the Smoocho menu including:

- **Signatures**: Choco Tsunami, Mango Tsunami, etc.
- **Crispy Rice Tubs**: 12 varieties with different toppings
- **Kunafa Bowls**: Traditional kunafa desserts
- **Choco Desserts**: Classic and Premium options
- **Fruits Choco Mix**: Fresh fruit combinations
- **Choco Icecreams**: Premium ice cream scoops
- **Drinks**: Milo, Malaysian Mango Milk, etc.

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Environment Variables

Create a `.env` file in the client directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=http://localhost:5000
```

## Next Steps

The following modules will be developed next:

1. **POS Module**: Touch-optimized billing interface
2. **Inventory Module**: Stock management and tracking
3. **Reports Module**: Analytics and insights
4. **Integrations**: Zomato, Swiggy, Paytm
5. **Offline Sync**: Enhanced offline functionality
6. **Alerts**: Email and WhatsApp notifications

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Add proper error handling
4. Test on tablet devices
5. Ensure touch-friendly interactions

## License

This project is part of the Smoocho POS system.
