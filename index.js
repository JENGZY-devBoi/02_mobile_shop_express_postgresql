const express = require('express');
require('dotenv').config();
const { Pool } = require('pg');

const app = express();

app.use(express.json());

const postgre_pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

postgre_pool.connect((err, client, release) => {
    if (err) {
        console.log('❌ Error connecting to PostgreSQL', err.stack);
        return;
    }

    console.log('✅ Connected to PostgreSQL database successfully');

    release();
});

postgre_pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

// Endpoints
app.get('/user', async (req, res) => {
    try {
        const result = await postgre_pool.query(
            `
                SELECT id, username, email, full_name, created_at
                FROM users
                ORDER BY created_at DESC
            `
        );

        res.status(200).json({
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

app.get('/user/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const result = await postgre_pool.query(
            `
                SELECT id, username, email, full_name, created_at
                FROM users
                WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json({
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user' });
    }
});

app.post('/user', async (req, res) => {
    try {
        const body = req.body;

        const result = await postgre_pool.query(
            `
                INSERT INTO users (username, email, password, full_name, phone, role)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, username, email, full_name, phone, role, created_at
            `,
            [
                body.username,
                body.email,
                body.password,
                body.full_name,
                body.phone,
                body.role || 'customer'
            ]
        );

        res.status(201).json({
            message: 'Create user successfully',
            detail: result.rows?.at(0)
        })
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Username or email already exists' });
        }
        
        res.status(500).json({ message: 'Failed to create user' });
    }
});

app.put('/user/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const body = req.body;

        const result = await postgre_pool.query(
            `
                UPDATE users 
                SET username = $1, email = $2, full_name = $3
                WHERE id = $4
                RETURNING id, username, email, full_name, created_at
            `,
            [
                body.username,
                body.email,
                body.full_name,
                id
            ]
        );

        if (result.rows.lenght === 0) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        res.status(200).json({
            message: 'Update user successfully',
            detail: result.rows?.at(0)
        });
    } catch (error) {
        console.log(error);

        if (error.code === '23505') {
            return res.status(409).json({ message: 'Username or email already exists' });
        }
        
        res.status(500).json({ message: 'Failed to create user' });
    }
});

app.delete('/user/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const result = await postgre_pool.query(
            `
                DELETE FROM users
                WHERE id = $1
                RETURNING id
            `,
            [
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

app.get('/product', async (req, res) => {
    try {
        const { category } = req.query;

        let query = 'SELECT * FROM products';
        let params = [];

        if (category) {
            query += ' WHERE category = $1';
            params.push(category);
        }

        query += ' ORDER BY created_at DESC';

        const result = await postgre_pool.query(query, params);

        res.status(200).json({
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products' });
    }
});

app.get('/product/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const result = await postgre_pool.query(
            `
                SELECT id, name, brand, price, stock, category, created_at
                FROM products
                WHERE id = $1
            `,
            [
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.status(200).json({
            data: result.rows[0]
        })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch product'
        });
    }
});

app.post('/product', async (req, res) => {
    try {
        const body = req.body;

        const result = await postgre_pool.query(
            `
                INSERT INTO products (name, brand, price, stock, category)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, name, brand, price, stock, category
            `,
            [
                body.name,
                body.brand,
                body.price,
                body.stock,
                body.category
            ]
        );

        res.status(201).json({
            message: 'Create product successfully',
            detail: result.rows?.at(0)
        })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to create product'
        });
    }
});

app.put('/product/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const body = req.body;

        const result = await postgre_pool.query(
            `
                UPDATE products
                SET name = $1, brand = $2, price = $3, stock = $4, category = $5
                WHERE id = $6
                RETURNING id, name, brand, price, category
            `,
            [
                body.name,
                body.brand,
                body.price,
                body.stock,
                body.category,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.status(200).json({
            message: 'Update product successfully',
            datail: result.rows?.at(0)
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to update product'
        });
    }
});

app.delete('/product/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const result = await postgre_pool.query(
            `
                DELETE FROM products
                WHERE id = $1
                RETURNING id
            `,
            [
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.status(200).json({
            message: 'Delete product successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to delete product'
        });
    }
});

app.listen(8000, () => {
    console.log('Application running on port 8000');
});
