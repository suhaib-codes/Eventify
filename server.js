require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;
const storedPassword = 'group2';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'database2',
  password: process.env.PASSWORD,
  port: process.env.PORT,
  database: process.env.DATABASE
});

app
  .use(express.static('public'))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())

  .post('/contactForm', (req, res) => {
    const { name, email, number, subject, message } = req.body;
    pool.query('INSERT INTO contact_us (name, email, number, subject, message) VALUES ($1, $2, $3, $4, $5)', [name, email, number, subject, message])
      .then(() => {
        res.send(`
          <script>
            alert('Contact information sent!');
            window.location.href = '/contact us.html';
          </script>
        `);
      })
      .catch(err => {
        console.error('Error inserting contact form data:', err);
        res.status(500).send('Error inserting contact form data');
      });
  })

  .post('/bookingForm', (req, res) => {
    const { first_name, last_name, email, number, address, description, price } = req.body;
    pool.query('INSERT INTO booking (first_name, last_name, email, number, address, description, plan) VALUES ($1, $2, $3, $4, $5, $6, $7)', [first_name, last_name, email, number, address, description, price])
      .then(() => {
        res.send(`
          <script>
            alert('Booking done successfully.');
            window.location.href = '/price.html';
          </script>
        `);
      })
      .catch(err => {
        console.error('Error inserting booking form data:', err);
        res.status(500).send('Error inserting booking form data');
      });
  })

  .get('/adminpanel', async (req, res) => {
    try {
      const contactResults = await pool.query('SELECT * FROM contact_us');
      const bookingResults = await pool.query('SELECT * FROM booking');

      const contactHtml = contactResults.rows.map((row, index) => `
        <div class="alert">
          <div class="alert-header">
            <p class="alert-title">${row.name}</p>
            <p class="alert-title">${row.email}</p>
          </div>
          <p class="alert-message">Subject: ${row.subject}</p>
          <p class="alert-message">Message: ${row.message}</p>
          <div class="alert-actions">
            
          </div>
        </div>
      `).join('');

      const bookingHtml = bookingResults.rows.map((row, index) => `
        <div class="alert">
          <div class="alert-header">
            <p class="alert-title">First Name: ${row.first_name}</p>
            <p class="alert-title">Last Name:${row.last_name}</p>
            <p class="alert-title">Email:${row.email}</p>
            <p class="alert-title">Phone no:${row.number}</p>
            <p class="alert-title">Plan selected:${row.plan}</p>
          </div>
          <p class="alert-message">Description:${row.description}</p>
          <div class="alert-actions">
            
          </div>
        </div>
      `).join('');

      const htmlPath = path.join(__dirname, 'public', 'adminPanel.html');
      let html = await fs.readFile(htmlPath, 'utf8');

      html = html.replace('{{contactHtml}}', contactHtml);
      html = html.replace('{{bookingHtml}}', bookingHtml);

      res.send(html);
    } catch (err) {
      console.error('Error fetching or rendering data:', err);
      res.status(500).send('Error fetching or rendering data');
    }
  })

  .post('/login', (req, res) => {
  const { password } = req.body;

  if (password === storedPassword) {
    res.redirect('/adminpanel');

} else {
  res.send('Incorrect Password. PLease try again');
}

  })

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
