const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const morgan = require('morgan'); // Add logging middleware

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000; // Match port with frontend expectations

// Enhanced logging for requests with connection details
app.use(morgan((tokens, req, res) => {
  const status = tokens.status(req, res);
  const statusColor = status >= 500 ? '31' : status >= 400 ? '33' : status >= 300 ? '36' : '32';
  
  return [
    '\n🔄 ',
    `\x1b[36m${tokens.method(req, res)}\x1b[0m`,
    `\x1b[${statusColor}m${status}\x1b[0m`,
    `\x1b[0m${tokens.url(req, res)}\x1b[0m`,
    `\x1b[33m${tokens['response-time'](req, res)} ms\x1b[0m`,
    `\x1b[33m${tokens.res(req, res, 'content-length') || '-'}\x1b[0m`,
    `\x1b[36m${tokens['remote-addr'](req, res)}\x1b[0m`,
    `\x1b[90m${tokens['user-agent'](req, res)}\x1b[0m`,
  ].join(' ');
}));

// Configure CORS - allow all origins with logging
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((req, res, next) => {
  console.log(`🌐 CORS request from origin: ${req.headers.origin || 'Unknown'}`);
  next();
});

// Parse JSON bodies
app.use(express.json());

// Database configuration
const DB_PATH = path.join(__dirname, './data/shopee-analytics.db');
const dataDir = path.dirname(DB_PATH);

console.log('💾 Database configuration:');
console.log(`📁 DB_PATH: ${DB_PATH}`);
console.log(`📂 Data directory: ${dataDir}`);

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`📂 Created data directory at ${dataDir}`);
}

// Database connection
const openDb = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error(`Error connecting to database: ${err.message}`);
        reject(err);
      } else {
        console.log('Connected to SQLite database');
        resolve(db);
      }
    });
  });
};

// Enhanced health endpoint with detailed info
app.get(['/health', '/api/health'], (req, res) => {
  try {
    const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error(`❌ Database connection error: ${err.message}`);
        return res.status(500).json({
          status: 'error',
          timestamp: new Date().toISOString(),
          database_status: 'disconnected',
          database_path: DB_PATH,
          database_exists: fs.existsSync(DB_PATH),
          database_error: err.message,
          server_port: PORT,
          environment: process.env.NODE_ENV || 'development'
        });
      } else {
        db.close();
        console.log('✅ Database health check: Connected successfully');
        return res.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          database_status: 'connected',
          database_path: DB_PATH,
          database_exists: true,
          server_port: PORT,
          api_base: `/api`,
          available_endpoints: [
            '/api/health',
            '/api/products',
            '/api/products/showcase',
            '/api/categories',
            '/api/categories/counts',
            '/api/debug/database'
          ],
          environment: process.env.NODE_ENV || 'development'
        });
      }
    });
  } catch (error) {
    console.error(`❌ Health check error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database_status: 'unknown',
      database_path: DB_PATH,
      database_error: error.message,
      server_port: PORT,
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Get showcase products - both with and without api prefix
app.get(['/products/showcase', '/api/products/showcase'], async (req, res) => {
  try {
    const db = await openDb();
    const sql = `
      SELECT 
        id, shopee_id, name AS product_name, price, original_price,
        image_url, shop_name, shop_id, commission_rate, 
        offer_link, rating_star, price_discount_rate, sales
      FROM products 
      WHERE image_url IS NOT NULL AND image_url != ''
      ORDER BY created_at DESC
      LIMIT 12
    `;
    
    db.all(sql, [], (err, products) => {
      db.close();
      
      if (err) {
        console.error(`Database error: ${err.message}`);
        return res.status(500).json({
          error: `Database error: ${err.message}`
        });
      }
      
      // Calculate additional fields for each product
      products.forEach(product => {
        // Calculate discount percentage
        if (product.original_price && product.price) {
          const discount = Math.round(100 - (product.price / product.original_price * 100));
          product.discount_percent = discount > 0 ? discount : 0;
        } else {
          product.discount_percent = 0;
        }
        
        // Format price
        if ('price' in product) {
          product.formatted_price = `R$ ${product.price.toFixed(2)}`.replace('.', ',');
        }
        
        // Convert commission to percentage
        if ('commission_rate' in product) {
          product.commission_percent = Math.round(product.commission_rate * 100 * 10) / 10;
        }
      });
      
      res.json({
        products,
        count: products.length,
        total_in_db: products.length, // We'd need another query to get the actual count
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error(`Error in get_showcase_products: ${error.message}`);
    res.status(500).json({
      products: [],
      error: error.message
    });
  }
});

// Get products endpoint - Add this to match frontend expectations
app.get(['/products', '/api/products'], async (req, res) => {
  try {
    const db = await openDb();
    const sql = `
      SELECT 
        id, shopee_id, name AS product_name, price, original_price,
        image_url, shop_name, shop_id, commission_rate, 
        offer_link, rating_star, price_discount_rate, sales
      FROM products 
      WHERE image_url IS NOT NULL AND image_url != ''
      ORDER BY created_at DESC
      LIMIT 12
    `;
    
    db.all(sql, [], (err, products) => {
      db.close();
      
      if (err) {
        console.error(`Database error: ${err.message}`);
        return res.status(500).json({
          error: `Database error: ${err.message}`
        });
      }
      
      // Calculate additional fields for each product
      products.forEach(product => {
        // Calculate discount percentage
        if (product.original_price && product.price) {
          const discount = Math.round(100 - (product.price / product.original_price * 100));
          product.discount_percent = discount > 0 ? discount : 0;
        } else {
          product.discount_percent = 0;
        }
        
        // Format price
        if ('price' in product) {
          product.formatted_price = `R$ ${product.price.toFixed(2)}`.replace('.', ',');
        }
        
        // Convert commission to percentage
        if ('commission_rate' in product) {
          product.commission_percent = Math.round(product.commission_rate * 100 * 10) / 10;
        }
      });
      
      res.json({
        products,
        count: products.length,
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error(`Error in get_products: ${error.message}`);
    res.status(500).json({
      products: [],
      error: error.message
    });
  }
});

// Get categories - both with and without api prefix
app.get(['/categories', '/api/categories'], async (req, res) => {
  try {
    const db = await openDb();
    db.all(
      `SELECT DISTINCT category_id as id, category_name as name
       FROM products
       WHERE category_id IS NOT NULL AND category_name IS NOT NULL
       ORDER BY category_name`, 
      [], 
      (err, categories) => {
        db.close();
        
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Add default icon URLs for each category
        categories.forEach(category => {
          if (!category.image_url) {
            category.image_url = `https://via.placeholder.com/64?text=${category.name}`;
          }
        });
        
        res.json(categories);
      }
    );
  } catch (error) {
    console.error(`Error in get_categories: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Get category counts - both with and without api prefix
app.get(['/categories/counts', '/api/categories/counts'], async (req, res) => {
  try {
    const db = await openDb();
    db.all(
      `SELECT category_id, COUNT(*) as product_count
       FROM products
       WHERE category_id IS NOT NULL
       GROUP BY category_id`, 
      [], 
      (err, rows) => {
        db.close();
        
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Convert to a dictionary with category_id as key
        const counts = {};
        rows.forEach(row => {
          counts[String(row.category_id)] = row.product_count;
        });
        
        res.json({ counts });
      }
    );
  } catch (error) {
    console.error(`Error in get_category_counts: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Debug database endpoint - to match FastAPI
app.get(['/debug/database', '/api/debug/database'], async (req, res) => {
  try {
    const db = await openDb();
    const result = {
      status: "checking",
      database_exists: fs.existsSync(DB_PATH),
      database_path: DB_PATH,
      tables: [],
      product_count: 0,
      sample_products: []
    };
    
    if (result.database_exists) {
      // Get tables
      db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
          db.close();
          result.status = "error";
          result.error = err.message;
          return res.json(result);
        }
        
        result.tables = tables.map(t => t.name);
        
        // Get product count
        if (result.tables.includes('products')) {
          db.get("SELECT COUNT(*) as count FROM products", [], (err, row) => {
            if (err) {
              db.close();
              result.status = "error";
              result.error = err.message;
              return res.json(result);
            }
            
            result.product_count = row.count;
            
            // Get sample products
            db.all("SELECT * FROM products LIMIT 3", [], (err, products) => {
              db.close();
              if (err) {
                result.status = "error";
                result.error = err.message;
              } else {
                result.sample_products = products;
                result.status = "complete";
              }
              res.json(result);
            });
          });
        } else {
          db.close();
          result.status = "complete";
          res.json(result);
        }
      });
    } else {
      result.status = "error";
      result.error = "Database file not found";
      res.json(result);
    }
  } catch (error) {
    res.json({
      status: "error",
      error: error.message,
      database_exists: false
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: "SENTINNELL Analytics API - Node.js Version",
    status: "online",
    documentation: "/docs",
    available_endpoints: {
      "API endpoints": [
        "/health",
        "/products",
        "/products/showcase",
        "/categories",
        "/categories/counts",
        "/debug/database"
      ]
    }
  });
});

// Starting the server with enhanced logging
app.listen(PORT, () => {
  console.log('\n');
  console.log('🚀 ===================================================');
  console.log(`🚀 SENTINNELL API Server running at http://localhost:${PORT}`);
  console.log('🚀 ===================================================');
  console.log('📊 Server Information:');
  console.log(`🔌 Port: ${PORT}`);
  console.log(`📁 Database: ${DB_PATH}`);
  console.log(`🌐 API Base: http://localhost:${PORT}/api`);
  console.log(`🌐 API Documentation: http://localhost:${PORT}/docs`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 ===================================================\n');
});
