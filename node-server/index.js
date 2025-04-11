const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração simplificada de logging
app.use(morgan('dev'));

// CORS simplificado
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Database configuration
const DB_PATH = path.join(__dirname, './data/shopee-analytics.db');
const dataDir = path.dirname(DB_PATH);

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database connection helper
const openDb = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) reject(err);
      else resolve(db);
    });
  });
};

// Health endpoint
app.get(['/health', '/api/health'], async (req, res) => {
  try {
    const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        return res.status(500).json({
          status: 'error',
          database_status: 'disconnected',
          database_error: err.message
        });
      } else {
        db.close();
        return res.json({
          status: 'ok',
          database_status: 'connected',
          api_base: `/api`
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Debug database endpoint
app.get(['/debug/database', '/api/debug/database'], (req, res) => {
  const databaseExists = fs.existsSync(DB_PATH);
  
  res.json({
    database_path: DB_PATH,
    database_exists: databaseExists,
    api_base: '/api'
  });
});

// Get showcase products
app.get(['/products/showcase', '/api/products/showcase'], async (req, res) => {
  try {
    const db = await openDb();
    const limit = parseInt(req.query.limit) || 12;
    
    const sql = `
      SELECT 
        id, shopee_id, name AS product_name, price, original_price,
        image_url, shop_name, shop_id, commission_rate, 
        offer_link, rating_star, price_discount_rate, sales
      FROM products
      WHERE price > 0 AND image_url IS NOT NULL
      ORDER BY 
        CASE 
          WHEN price_discount_rate >= 50 THEN 1
          WHEN sales >= 1000 THEN 2
          ELSE 3
        END,
        sales DESC, rating_star DESC
      LIMIT ?
    `;
    
    db.all(sql, [limit], (err, rows) => {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({ products: rows });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get products by category
app.get(['/products', '/api/products'], async (req, res) => {
  try {
    const db = await openDb();
    
    const { 
      category, 
      page = 1, 
      limit = 20,
      sort,
      price_range,
      search
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Construir a query base
    let sql = `
      SELECT 
        p.id, p.shopee_id, p.name AS product_name, p.price, 
        p.original_price, p.image_url, p.shop_name, p.shop_id, 
        p.commission_rate, p.offer_link, p.rating_star, 
        p.price_discount_rate, p.sales,
        c.CategoryName
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    
    // Construir o array de parâmetros
    const params = [];
    
    // Adicionar filtro de categoria
    if (category) {
      sql += ` AND p.category_id = ?`;
      params.push(category);
    }
    
    // Adicionar filtro de preço
    if (price_range) {
      const [min, max] = price_range.split('-');
      if (min && max) {
        sql += ` AND p.price BETWEEN ? AND ?`;
        params.push(parseFloat(min), parseFloat(max));
      } else if (min && min.endsWith('+')) {
        const minValue = parseFloat(min.slice(0, -1));
        sql += ` AND p.price >= ?`;
        params.push(minValue);
      }
    }
    
    // Adicionar filtro de busca
    if (search) {
      sql += ` AND (p.name LIKE ? OR p.shop_name LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }
    
    // Adicionar ordenação
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sql += ` ORDER BY p.price ASC`;
          break;
        case 'price_desc':
          sql += ` ORDER BY p.price DESC`;
          break;
        case 'name_asc':
          sql += ` ORDER BY p.name ASC`;
          break;
        case 'name_desc':
          sql += ` ORDER BY p.name DESC`;
          break;
        default:
          sql += ` ORDER BY p.sales DESC, p.rating_star DESC`;
      }
    } else {
      sql += ` ORDER BY p.sales DESC, p.rating_star DESC`;
    }
    
    // Adicionar paginação
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    // Query para o total de produtos
    let countSql = `
      SELECT COUNT(*) as total
      FROM products p
      WHERE 1=1
    `;
    
    const countParams = [];
    
    if (category) {
      countSql += ` AND p.category_id = ?`;
      countParams.push(category);
    }
    
    if (price_range) {
      const [min, max] = price_range.split('-');
      if (min && max) {
        countSql += ` AND p.price BETWEEN ? AND ?`;
        countParams.push(parseFloat(min), parseFloat(max));
      } else if (min && min.endsWith('+')) {
        const minValue = parseFloat(min.slice(0, -1));
        countSql += ` AND p.price >= ?`;
        countParams.push(minValue);
      }
    }
    
    if (search) {
      countSql += ` AND (p.name LIKE ? OR p.shop_name LIKE ?)`;
      const searchParam = `%${search}%`;
      countParams.push(searchParam, searchParam);
    }
    
    db.get(countSql, countParams, (countErr, countRow) => {
      if (countErr) {
        db.close();
        return res.status(500).json({ error: countErr.message });
      }
      
      db.all(sql, params, (err, rows) => {
        db.close();
        
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        res.json({
          products: rows,
          total: countRow ? countRow.total : 0,
          page: parseInt(page),
          limit: parseInt(limit)
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get categories
app.get(['/categories', '/api/categories'], async (req, res) => {
  try {
    const db = await openDb();
    
    const sql = `
      SELECT c.id, c.CategoryName as name, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id, c.CategoryName
      HAVING COUNT(p.id) > 0
      ORDER BY COUNT(p.id) DESC
    `;
    
    db.all(sql, [], (err, rows) => {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Adicionar imagens às categorias
      const categoriesWithImages = rows.map(category => ({
        ...category,
        id: String(category.id), // Garantir que o ID seja string
        image_url: `https://via.placeholder.com/64?text=${encodeURIComponent(category.name)}`
      }));
      
      res.json(categoriesWithImages);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get category counts
app.get(['/categories/counts', '/api/categories/counts'], async (req, res) => {
  try {
    const db = await openDb();
    
    const sql = `
      SELECT category_id, CategoryName, COUNT(*) as product_count
      FROM products
      LEFT JOIN categories ON products.category_id = categories.id
      WHERE category_id IS NOT NULL
      GROUP BY category_id, CategoryName
    `;
    
    db.all(sql, [], (err, rows) => {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Transformar em objeto para acesso mais fácil
      const counts = {};
      rows.forEach(row => {
        counts[row.category_id] = {
          count: row.product_count,
          name: row.CategoryName
        };
      });
      
      res.json({ counts });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
