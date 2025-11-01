const express = require('express');
const cors = require('cors');
const db = require('./database');
const sendEmail = require('./sendEmail');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Get all events, always return an array
app.get('/events', (req, res) => {
  db.query('SELECT * FROM events', (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.json([]);
    }
    res.json(Array.isArray(results) ? results : []);
  });
});

// Create a new event
app.post('/events', (req, res) => {
  const { title, description, date, location, image_url } = req.body;
  if (!title || !description || !date || !location) {
    return res.status(400).json({error: 'Missing required fields'});
  }
  db.query('INSERT INTO events SET ?', { title, description, date, location, image_url: image_url || null }, (err, result) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({error: 'Error creating event'});
    }
    res.json({ message: 'Event created successfully!', event_id: result.insertId });
  });
});

// Book an event
app.post('/book', (req, res) => {
  const { event_id, child_name, parent_email, parent_phone, age_range, event_location } = req.body;
  if (!event_id || !child_name || !parent_email || !age_range || !event_location) {
    return res.status(400).json({error: 'Missing required fields'});
  }
  const confirmation_code = uuidv4();
  const booking = { event_id, child_name, parent_email, parent_phone, age_range, event_location, confirmation_code };
  // Insert the booking as pending payment
  db.query('INSERT INTO bookings SET ?', booking, (err, result) => {
    if (err) return res.status(500).json({error: 'DB error'});
    
    // TODO: Initiate MoMo payment here
    // Example MoMo API integration placeholder:
    // const momoResponse = await initiateMoMoPayment({
    //   amount: eventPrice,
    //   phone: parent_phone,
    //   booking_id: result.insertId,
    //   callback_url: `${process.env.BACKEND_URL}/webhook/momo`
    // });
    // 
    // For now, return booking ID and confirmation code
    // The actual MoMo integration will be added when you provide your API credentials
    
    res.json({ 
      message: 'Booking created. MoMo payment will be initiated.', 
      booking_id: result.insertId,
      confirmation_code: confirmation_code,
      // When MoMo is integrated, include payment link here:
      // payment_url: momoResponse.payment_url
    });
  });
});

// MoMo payment webhook
app.post('/webhook/momo', async (req, res) => {
  const { payment_reference, status, booking_id } = req.body; // expect your MoMo API to send these
  if (status === 'SUCCESS') {
    // Mark booking as paid and set payment_reference
    db.query('UPDATE bookings SET paid=1, payment_reference=? WHERE id=?', [payment_reference, booking_id], (err) => {
      if (err) return res.status(500).json({error: 'DB error'});
      // Get booking and event details for email
      db.query('SELECT b.*, e.title, e.date, e.location FROM bookings b JOIN events e ON b.event_id = e.id WHERE b.id=?', [booking_id], async (err, results) => {
        if (!err && results && results[0]) {
          const booking = results[0];
          // Generate QR code PNG buffer with confirmation code
          const qrBuffer = await QRCode.toBuffer(booking.confirmation_code || String(booking.id));
          // Send ticket email with QR
          sendEmail({
            to: booking.parent_email,
            subject: `Your Ticket for ${booking.title}`,
            html: `<h2>Thank you for booking ${booking.title}!</h2><p>Event Date: ${booking.date}<br>Location: ${booking.location}</p><p><b>Confirmation Code:</b> ${booking.confirmation_code}</p><p>Scan the attached QR code at the event gate.</p>`,
            attachments: [
              {
                filename: 'ticket-qr.png',
                content: qrBuffer
              }
            ]
          }).then(() => {
            res.json({ message: 'Payment confirmed, email with QR ticket sent.' });
          }).catch((err) => {
            res.status(500).json({error: 'Email failed', details: err.message });
          });
        } else {
          res.status(500).json({error: 'Booking info not found'});
        }
      });
    });
  } else {
    res.json({ message: 'Payment status ignored.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
