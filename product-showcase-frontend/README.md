# Product Showcase Frontend

This is a React-based frontend application for showcasing products from Shopee. The application is designed to provide users with an intuitive interface to explore various product categories, view special offers, and subscribe to newsletters for exclusive deals.

## Port Configuration
- Frontend: Runs on port 3000
- Backend API: Runs on port 5000

## Project Structure

The project is organized as follows:

```
product-showcase-frontend
├── public
│   ├── favicon.ico          # Favicon for the application
│   ├── index.html           # Main HTML file serving as the entry point
│   └── manifest.json        # Metadata about the application
├── src
│   ├── api
│   │   └── connector.js     # Functions to connect to the backend API
│   ├── assets
│   │   └── img
│   │       └── logo.jpg     # Logo image used in the application
│   ├── components
│   │   ├── Banner.jsx       # Main promotional banner component
│   │   ├── Categories.jsx    # Component displaying product categories
│   │   ├── Footer.jsx        # Footer section component
│   │   ├── Header.jsx        # Header section component
│   │   ├── Layout.jsx        # Layout wrapper for the application
│   │   ├── Newsletter.jsx    # Newsletter subscription form component
│   │   ├── ProductCard.jsx   # Individual product card component
│   │   ├── SpecialOffers.jsx  # Component showcasing special offers
│   │   └── RecentProducts.jsx # Component displaying recently added products
│   ├── context
│   │   └── ProductContext.jsx # Context for managing product data
│   ├── hooks
│   │   └── useProducts.js    # Custom hook for fetching product data
│   ├── pages
│   │   ├── Home.jsx          # Home page component
│   │   └── CategoryPage.jsx  # Component displaying products by category
│   ├── styles
│   │   └── tailwind.css      # Tailwind CSS styles
│   ├── utils
│   │   └── formatters.js      # Utility functions for formatting data
│   ├── App.jsx               # Main application component
│   ├── index.jsx             # Entry point for the React application
│   └── config.js             # Configuration settings
├── .env                      # Environment variables
├── .gitignore                # Files and directories to ignore by Git
├── package.json              # Project metadata and dependencies
├── tailwind.config.js        # Tailwind CSS configuration
└── README.md                 # Project documentation
```

## Getting Started

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd product-showcase-frontend
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm start
   ```

4. **Build for production:**
   ```
   npm run build
   ```

## Deployment

This application is designed to be deployed on Vercel. Ensure that your environment variables are set correctly in the Vercel dashboard.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.