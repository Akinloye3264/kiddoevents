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

// Get all packages
app.get('/packages', (req, res) => {
  db.query('SELECT * FROM packages ORDER BY price ASC', (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.json([]);
    }
    res.json(Array.isArray(results) ? results : []);
  });
});

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

// Book an event with package
app.post('/book', async (req, res) => {
  const { package_id, parent_name, parent_email, parent_phone, child_name, age_range, event_location, event_description } = req.body;
  if (!package_id || !parent_name || !parent_email || !parent_phone || !child_name || !age_range || !event_location) {
    return res.status(400).json({error: 'Missing required fields'});
  }
  
  // Get package details to get price
  db.query('SELECT * FROM packages WHERE id = ?', [package_id], async (err, packageResults) => {
    if (err || !packageResults || packageResults.length === 0) {
      return res.status(400).json({error: 'Invalid package'});
    }
    
    const packageData = packageResults[0];
    const confirmation_code = uuidv4();
    const booking = { 
      package_id, 
      parent_name,
      child_name, 
      parent_email, 
      parent_phone, 
      age_range, 
      event_location,
      event_description: event_description || null,
      confirmation_code 
    };
    
    // Insert the booking as pending payment
    db.query('INSERT INTO bookings SET ?', booking, async (err, result) => {
      if (err) {
        console.error('Booking error:', err);
        return res.status(500).json({error: 'DB error'});
      }
      
      // Initiate MoMo payment
      try {
        const amount = packageData.price;
        const momoResponse = await initiateMoMoPayment({
          amount: amount,
          phone: parent_phone,
          booking_id: result.insertId,
          callback_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/webhook/momo`,
          external_reference: confirmation_code
        });
        
        res.json({ 
          message: 'Booking created. Please complete payment.', 
          booking_id: result.insertId,
          confirmation_code: confirmation_code,
          payment_url: momoResponse.payment_url || null,
          amount: amount
        });
      } catch (momoError) {
        console.error('MoMo payment error:', momoError);
        // Still return booking info even if MoMo fails
        res.json({ 
          message: 'Booking created. Payment initiation failed.', 
          booking_id: result.insertId,
          confirmation_code: confirmation_code,
          amount: packageData.price
        });
      }
    });
  });
});

// MoMo payment initiation function
async function initiateMoMoPayment({ amount, phone, booking_id, callback_url, external_reference }) {
  const apiKey = process.env.MOMO_API_KEY;
  const apiSecret = process.env.MOMO_API_SECRET;
  const apiUser = process.env.MOMO_API_USER;
  const environment = process.env.MOMO_ENVIRONMENT || 'sandbox';
  const baseUrl = environment === 'production' 
    ? 'https://api.mtn.com/v1/collections'
    : 'https://sandbox.momodeveloper.mtn.com/v1/collections';
  
  if (!apiKey || !apiSecret || !apiUser) {
    throw new Error('MoMo credentials not configured');
  }
  
  // Generate access token
  const tokenResponse = await fetch(`${baseUrl}/token/`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${apiUser}:${apiSecret}`).toString('base64')}`,
      'Ocp-Apim-Subscription-Key': apiKey
    }
  });
  
  if (!tokenResponse.ok) {
    throw new Error('Failed to get MoMo access token');
  }
  
  const { access_token } = await tokenResponse.json();
  
  // Request payment
  const paymentData = {
    amount: amount.toString(),
    currency: 'GHS',
    externalId: external_reference,
    payer: {
      partyIdType: 'MSISDN',
      partyId: phone.replace(/[^0-9]/g, '')
    },
    payerMessage: `Kiddovents Booking ${external_reference}`,
    payeeNote: `Booking ID: ${booking_id}`
  };
  
  const paymentResponse = await fetch(`${baseUrl}/requesttopay`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'X-Target-Environment': environment === 'production' ? 'mtnghana' : 'sandbox',
      'Ocp-Apim-Subscription-Key': apiKey,
      'Content-Type': 'application/json',
      'X-Reference-Id': external_reference
    },
    body: JSON.stringify(paymentData)
  });
  
  if (!paymentResponse.ok) {
    const errorText = await paymentResponse.text();
    throw new Error(`MoMo payment request failed: ${errorText}`);
  }
  
  return {
    payment_url: null, // MoMo Collections API doesn't return a URL, it directly debits
    reference: external_reference
  };
}

// MoMo payment webhook
app.post('/webhook/momo', async (req, res) => {
  const { payment_reference, status, external_reference } = req.body;
  
  // Find booking by confirmation_code (external_reference)
  db.query('SELECT * FROM bookings WHERE confirmation_code = ?', [external_reference], async (err, bookingResults) => {
    if (err || !bookingResults || bookingResults.length === 0) {
      return res.status(404).json({error: 'Booking not found'});
    }
    
    const booking = bookingResults[0];
    const booking_id = booking.id;
    
    if (status === 'SUCCESS' || status === 'SUCCESSFUL') {
      // Mark booking as paid and set payment_reference
      db.query('UPDATE bookings SET paid=1, payment_reference=? WHERE id=?', [payment_reference || external_reference, booking_id], (err) => {
        if (err) return res.status(500).json({error: 'DB error'});
        
        // Get package details
        db.query('SELECT * FROM packages WHERE id = ?', [booking.package_id], async (err, packageResults) => {
          const packageData = packageResults && packageResults[0] ? packageResults[0] : null;
          
          // Generate QR code PNG buffer with confirmation code
          const qrBuffer = await QRCode.toBuffer(booking.confirmation_code || String(booking.id));
          
          // Send ticket email with QR
          const emailHtml = `
            <h2>Thank you for booking with Kiddovents!</h2>
            <p><b>Confirmation Code:</b> ${booking.confirmation_code}</p>
            ${packageData ? `<p><b>Package:</b> ${packageData.name} - $${packageData.price}</p>` : ''}
            <p><b>Child's Name:</b> ${booking.child_name}</p>
            <p><b>Age Range:</b> ${booking.age_range}</p>
            <p><b>Location:</b> ${booking.event_location}</p>
            ${booking.event_description ? `<p><b>Event Description:</b> ${booking.event_description}</p>` : ''}
            <p>Scan the attached QR code at the event gate.</p>
          `;
          
          sendEmail({
            to: booking.parent_email,
            subject: `Your Kiddovents Booking Confirmation`,
            html: emailHtml,
            attachments: [
              {
                filename: 'ticket-qr.png',
                content: qrBuffer
              }
            ]
          }).then(() => {
            res.json({ message: 'Payment confirmed, email with QR ticket sent.' });
          }).catch((err) => {
            console.error('Email error:', err);
            res.status(500).json({error: 'Email failed', details: err.message });
          });
        });
      });
    } else {
      res.json({ message: 'Payment status ignored.' });
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
