import React, { useEffect, useState } from 'react';
import theme from './theme';
import './App.css';

function App() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ child_name: '', parent_email: '', parent_phone: '', age_range: '', event_location: '', });
  const [bookingStatus, setBookingStatus] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', date: '', location: '', image_url: '' });
  const [createStatus, setCreateStatus] = useState(null);
  const ageRanges = [ '0-2', '3-5', '6-8', '9-12', '13+' ];
  const locations = ['Indoor','Outdoor'];

  useEffect(() => {
    fetchEvents();
  }, []);

  function fetchEvents() {
    setLoading(true);
    fetch('http://localhost:5000/events')
      .then(res => res.json())
      .then(data => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load events');
        setLoading(false);
        setEvents([]);
      });
  }

  const openBooking = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
    setForm({ child_name:'', parent_email:'', parent_phone:'', age_range:'', event_location:'' });
    setBookingStatus(null);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setBookingStatus(null);
  };

  async function submitBooking(e) {
    e.preventDefault();
    setBookingStatus('pending');
    try {
      const res = await fetch('http://localhost:5000/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: selectedEvent.id,
          ...form
        })
      });
      const data = await res.json();
      if(res.ok) {
        // Initiate MoMo payment (placeholder - you'll add your API here)
        setBookingStatus('success');
        // After successful booking, trigger MoMo payment
        // TODO: Replace with actual MoMo API call
        // Example: initiateMoMoPayment(data.booking_id, form.parent_phone);
        setForm({ child_name:'', parent_email:'', parent_phone:'', age_range:'', event_location:'' });
        setTimeout(() => closeModal(), 2000);
      } else {
        setBookingStatus('error');
      }
    } catch {
      setBookingStatus('error');
    }
  }

  const openCreateModal = () => {
    setShowCreateModal(true);
    setCreateForm({ title: '', description: '', date: '', location: '', image_url: '' });
    setCreateStatus(null);
  };
  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateStatus(null);
  };

  async function submitCreateEvent(e) {
    e.preventDefault();
    setCreateStatus('pending');
    try {
      const res = await fetch('http://localhost:5000/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });
      const data = await res.json();
      if(res.ok) {
        setCreateStatus('success');
        setCreateForm({ title: '', description: '', date: '', location: '', image_url: '' });
        fetchEvents(); // Refresh events list
        setTimeout(() => closeCreateModal(), 2000);
      } else {
        setCreateStatus('error');
      }
    } catch {
      setCreateStatus('error');
    }
  }

  return (
    <div style={{ background: theme.background, minHeight: '100vh', fontFamily: 'Comic Sans MS, Comic Sans, cursive' }}>
      <header style={{background: 'linear-gradient(90deg, #ff6f61, #fd6efd 70%)', color: 'white', padding: '24px 0', textAlign: 'center', boxShadow: '0 2px 12px #fda6d855'}}>
        <img src="/kiddoventsLogo.png" alt="Kiddovents Logo" style={{height:60, borderRadius: 32, marginBottom:6, boxShadow:'0px 2.5px 16px #d17be977'}} />
        <div style={{ fontFamily: 'Fredoka One, Baloo 2, Comic Sans MS', fontSize: 42, fontWeight: 900, letterSpacing: 2, color: '#fff', marginTop: 8 }}>KiddoEvents</div>
        <div style={{fontSize:22,margin: '7px 0 15px', color:'#fffde4'}}>Where Fun Begins!</div>
      </header>
      <nav style={{display:'flex',justifyContent:'center',gap:24,padding:'24px 12px 0'}}>
        <button style={{background:'linear-gradient(90deg,#ff6f61,#4fc3f7)',color:'#fff',fontWeight:700,border:'none',borderRadius:30,padding:'10px 20px',fontSize:16,boxShadow:'0 2px 10px #fab7',cursor:'pointer'}}>Events & Ticketing</button>
        <button onClick={openCreateModal} style={{background:'#fff',color:theme.text,border:'none',borderRadius:30,padding:'10px 20px',fontSize:16,cursor:'pointer'}}>+ Create Event</button>
        <button style={{background:'#fff',color:theme.text,border:'none',borderRadius:30,padding:'10px 20px',fontSize:16,cursor:'pointer'}}>Kids Store</button>
      </nav>
      <main style={{ maxWidth: 980, margin: 'auto', padding: '2rem', color: theme.text }}>
        <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:19,margin:'2rem 0 2rem 0'}}>
          <input placeholder="Search events, categories, or descriptions..." style={{flex:1,marginRight:14,padding:10,borderRadius:16,fontSize:17,border:'1.5px solid #cacafb'}} disabled />
          <select style={{borderRadius:16,padding:9,fontSize:16}} disabled><option>All Categories</option></select>
          <select style={{borderRadius:16,padding:9,fontSize:16}} disabled><option>All Ages</option></select>
          <select style={{borderRadius:16,padding:9,fontSize:16}} disabled><option>All Locations</option></select>
        </div>
        {loading && <div style={{textAlign:'center'}}>Loading events...</div>}
        {error && <div style={{color:'red', textAlign:'center'}}>{error}</div>}
        {!loading && !error && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 34, justifyContent: 'center' }}>
            {events.map(ev => (
              <div key={ev.id} style={{ background: 'white', border: `3.3px solid ${theme.border}`, borderRadius: 22, width: 350, padding: 22, boxShadow: '0 3px 23px #0001', margin: 8 }}>
                {ev.image_url && <img alt={ev.title} src={ev.image_url} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 16, border: `2px solid ${theme.accent}` }} />}
                <h3 style={{ fontFamily: 'Fredoka One, Baloo 2, Comic Sans MS', color: '#ff6f61', fontSize: 28, margin: '10px 0 2px' }}>{ev.title}</h3>
                <p style={{fontSize:16, color:'#2d2664'}}>{ev.description}</p>
                <div style={{ fontSize: 15, color: theme.secondary, margin: '9px 0' }}><b>Date:</b> {new Date(ev.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                <div style={{ fontSize: 14, marginBottom: 4 }}><b>Location:</b> {ev.location}</div>
                <button style={{ background: 'linear-gradient(90deg,#ff6f61,#4fc3f7)', color: '#fff', padding: '14px 22px', borderRadius: 20, border: 'none', fontSize: 20, cursor: 'pointer', fontWeight: 700,marginTop:8 }} onClick={() => openBooking(ev)}>Book Event</button>
              </div>
            ))}
          </div>
        )}
      </main>
      {showModal && selectedEvent && (
        <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'#0007', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99 }}>
          <div style={{ background: 'white', borderRadius:18, maxWidth:380, width:'100%', padding:32, position: 'relative', boxShadow: '0 4px 30px #1232', border:'3px solid #ff6f61'}}>
            <button onClick={closeModal} style={{ position: 'absolute', top:12, right: 14, background:'none', border: 'none', fontSize: 28, cursor: 'pointer' }}>&times;</button>
            <h2 style={{ color: '#ff6f61', marginBottom: 14, fontFamily:'Fredoka One, Baloo 2', fontWeight:800 }}>Book {selectedEvent.title}</h2>
            <form style={{display:'flex', flexDirection:'column', gap:16}} onSubmit={submitBooking}>
              <input required value={form.child_name} onChange={e=>setForm(f=>({...f,child_name:e.target.value}))} placeholder="Child's Name" style={{padding:13, fontSize:18, borderRadius:9, border:'2px solid #ffd600', background:'none', fontWeight:700}} />
              <input required type="email" value={form.parent_email} onChange={e=>setForm(f=>({...f,parent_email:e.target.value}))} placeholder="Parent Email" style={{padding:13, fontSize:18, borderRadius:9, border:'2px solid #ffd600', background:'none', fontWeight:700}} />
              <input required value={form.parent_phone} onChange={e=>setForm(f=>({...f,parent_phone:e.target.value}))} placeholder="Parent Phone" style={{padding:13, fontSize:18, borderRadius:9, border:'2px solid #ffd600', background:'none', fontWeight:700}} />
              <select required value={form.age_range} onChange={e=>setForm(f=>({...f,age_range:e.target.value}))} style={{padding:13, fontSize:18, borderRadius:9, border:'2px solid #ffd600', background:'none', fontWeight:700}}>
                <option value="">Select Age Range</option>
                {ageRanges.map(ar => <option key={ar} value={ar}>{ar}</option>)}
              </select>
              <select required value={form.event_location} onChange={e=>setForm(f=>({...f,event_location:e.target.value}))} style={{padding:13, fontSize:18, borderRadius:9, border:'2px solid #ffd600', background:'none', fontWeight:700}}>
                <option value="">Event Location</option>
                {locations.map(lc => <option key={lc} value={lc}>{lc}</option>)}
              </select>
              <button type="submit" style={{background: '#ff6f61', color:'#fff', padding:'16px 18px', fontSize:21, fontWeight:700, border:'none', borderRadius:12, marginTop:7, boxShadow:'0 2px 10px #fdc169'}}>Checkout with MoMo</button>
            </form>
            {bookingStatus === 'pending' && <div style={{marginTop:10,fontWeight:700, color:'#4fc3f7'}}>Processing booking…</div>}
            {bookingStatus === 'success' && <div style={{marginTop:10, fontWeight:700, color:'green'}}>Booking created! MoMo payment will be initiated. Check your email after payment confirmation.</div>}
            {bookingStatus === 'error' && <div style={{marginTop:10, fontWeight:700, color:'red'}}>Booking failed. Try again later.</div>}
          </div>
        </div>
      )}
      {showCreateModal && (
        <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'#0007', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99 }}>
          <div style={{ background: 'white', borderRadius:18, maxWidth:420, width:'100%', padding:32, position: 'relative', boxShadow: '0 4px 30px #1232', border:'3px solid #4fc3f7'}}>
            <button onClick={closeCreateModal} style={{ position: 'absolute', top:12, right: 14, background:'none', border: 'none', fontSize: 28, cursor: 'pointer' }}>&times;</button>
            <h2 style={{ color: '#4fc3f7', marginBottom: 14, fontFamily:'Fredoka One, Baloo 2', fontWeight:800 }}>Create New Event</h2>
            <form style={{display:'flex', flexDirection:'column', gap:16}} onSubmit={submitCreateEvent}>
              <input required value={createForm.title} onChange={e=>setCreateForm(f=>({...f,title:e.target.value}))} placeholder="Event Title" style={{padding:13, fontSize:18, borderRadius:9, border:'2px solid #ffd600', background:'none', fontWeight:700}} />
              <textarea required value={createForm.description} onChange={e=>setCreateForm(f=>({...f,description:e.target.value}))} placeholder="Event Description" rows={3} style={{padding:13, fontSize:18, borderRadius:9, border:'2px solid #ffd600', background:'none', fontWeight:700, resize:'vertical'}} />
              <input required type="date" value={createForm.date} onChange={e=>setCreateForm(f=>({...f,date:e.target.value}))} placeholder="Event Date" style={{padding:13, fontSize:18, borderRadius:9, border:'2px solid #ffd600', background:'none', fontWeight:700}} />
              <input required value={createForm.location} onChange={e=>setCreateForm(f=>({...f,location:e.target.value}))} placeholder="Event Location" style={{padding:13, fontSize:18, borderRadius:9, border:'2px solid #ffd600', background:'none', fontWeight:700}} />
              <input value={createForm.image_url} onChange={e=>setCreateForm(f=>({...f,image_url:e.target.value}))} placeholder="Image URL (Optional)" style={{padding:13, fontSize:18, borderRadius:9, border:'2px solid #ffd600', background:'none', fontWeight:700}} />
              <button type="submit" style={{background: 'linear-gradient(90deg,#4fc3f7,#ff6f61)', color:'#fff', padding:'16px 18px', fontSize:21, fontWeight:700, border:'none', borderRadius:12, marginTop:7, boxShadow:'0 2px 10px #fdc169', cursor:'pointer'}}>Create Event</button>
            </form>
            {createStatus === 'pending' && <div style={{marginTop:10,fontWeight:700, color:'#4fc3f7'}}>Creating event…</div>}
            {createStatus === 'success' && <div style={{marginTop:10, fontWeight:700, color:'green'}}>Event created successfully!</div>}
            {createStatus === 'error' && <div style={{marginTop:10, fontWeight:700, color:'red'}}>Failed to create event. Try again.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
