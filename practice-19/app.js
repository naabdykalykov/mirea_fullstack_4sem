require('dotenv').config();

const express = require('express');
const { pool, initDb } = require('./db');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    age: row.age,
    created_at: Number(row.created_at),
    updated_at: Number(row.updated_at),
  };
}

function parseId(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'id должен быть положительным целым числом' });
    return null;
  }
  return id;
}

app.get('/', (req, res) => {
  res.json({
    message: 'Practice 19 — PostgreSQL CRUD API',
    endpoints: [
      'POST   /api/users',
      'GET    /api/users',
      'GET    /api/users/:id',
      'PATCH  /api/users/:id',
      'DELETE /api/users/:id',
    ],
  });
});

app.post('/api/users', async (req, res) => {
  try {
    const { first_name, last_name, age } = req.body || {};

    if (typeof first_name !== 'string' || !first_name.trim()) {
      return res.status(400).json({ error: 'first_name обязателен' });
    }
    if (typeof last_name !== 'string' || !last_name.trim()) {
      return res.status(400).json({ error: 'last_name обязателен' });
    }
    if (!Number.isInteger(age) || age < 0) {
      return res.status(400).json({ error: 'age должен быть неотрицательным целым числом' });
    }

    const now = Date.now();
    const { rows } = await pool.query(
      `INSERT INTO users (first_name, last_name, age, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $4)
       RETURNING *`,
      [first_name.trim(), last_name.trim(), age, now],
    );
    res.status(201).json(rowToUser(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(rows.map(rowToUser));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const id = parseId(req, res);
    if (id === null) return;

    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(rowToUser(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    const id = parseId(req, res);
    if (id === null) return;

    const { first_name, last_name, age } = req.body || {};
    const sets = [];
    const values = [];
    let i = 1;

    if (first_name !== undefined) {
      if (typeof first_name !== 'string' || !first_name.trim()) {
        return res.status(400).json({ error: 'first_name должен быть непустой строкой' });
      }
      sets.push(`first_name = $${i++}`);
      values.push(first_name.trim());
    }
    if (last_name !== undefined) {
      if (typeof last_name !== 'string' || !last_name.trim()) {
        return res.status(400).json({ error: 'last_name должен быть непустой строкой' });
      }
      sets.push(`last_name = $${i++}`);
      values.push(last_name.trim());
    }
    if (age !== undefined) {
      if (!Number.isInteger(age) || age < 0) {
        return res.status(400).json({ error: 'age должен быть неотрицательным целым числом' });
      }
      sets.push(`age = $${i++}`);
      values.push(age);
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'Не передано ни одного поля для обновления' });
    }

    sets.push(`updated_at = $${i++}`);
    values.push(Date.now());
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      values,
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(rowToUser(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const id = parseId(req, res);
    if (id === null) return;

    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Сервер запущен на http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Не удалось инициализировать PostgreSQL:');
    console.error(err.message);
    console.error('\nПроверьте, что:');
    console.error(' 1. PostgreSQL запущен и доступен');
    console.error(' 2. База данных существует (например: createdb practice19)');
    console.error(' 3. DATABASE_URL или PG*-переменные в .env заданы верно');
    process.exit(1);
  });
