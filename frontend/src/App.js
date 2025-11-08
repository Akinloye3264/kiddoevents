import React, { useEffect, useState } from 'react';
import './App.css';
function App() {
  const [packages, setPackages] = useState([]);
  const [showPackagesModal, setShowPackagesModal] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    child_name: '',
    age_range: '',
    event_location: '',
    event_description: ''
  });
  const [bookingStatus, setBookingStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);

  const ageRanges = ['0-2', '3-5', '6-8', '9-12', '13+'];
  const locations = ['Indoor', 'Outdoor'];

  useEffect(() => {
    fetchPackages();
  }, []);

  function fetchPackages() {
    fetch('http://localhost:5000/packages')
      .then(res => res.json())
      .then(data => {
        setPackages(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Failed to load packages:', err);
        setPackages([]);
      });
  }

  const handleBookExperience = () => {
    setShowPackagesModal(true);
    setSelectedPackage(null);
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setShowPackagesModal(false);
    setShowBookingForm(true);
    setBookingStatus(null);
  };

  const handleCloseBookingForm = () => {
    setShowBookingForm(false);
    setSelectedPackage(null);
    setBookingForm({
      parent_name: '',
      parent_email: '',
      parent_phone: '',
      child_name: '',
      age_range: '',
      event_location: '',
      event_description: ''
    });
    setBookingStatus(null);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setBookingStatus('pending');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: selectedPackage.id,
          ...bookingForm
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setBookingStatus('success');
        setLoading(false);
        // Reset form after 3 seconds
        setTimeout(() => {
          handleCloseBookingForm();
        }, 3000);
      } else {
        setBookingStatus('error');
        setLoading(false);
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingStatus('error');
      setLoading(false);
    }
  };

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'heart':
        return <i className="fi fi-sr-heart" aria-hidden="true" />;
      case 'star':
        return <i className="fi fi-sr-star" aria-hidden="true" />;
      case 'crown':
        return <i className="fi fi-sr-crown" aria-hidden="true" />;
      default:
        return <i className="fi fi-rr-sparkles" aria-hidden="true" />;
    }
  };

  return (
    <div className="app">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <img src='kiddoventsLogo.png' alt='Kiddovents Logo' className='kiddovents-logo' width={150} height={100}/>
          <p className="kiddovents-presents">Kiddovents Presents</p>
          <h1 className="hero-title">The Season of Togetherness</h1>
          <p className="hero-subtitle">The Gift of Time</p>
          <p className="hero-description">
            Create magical memories with your loved ones this season. Join us for unforgettable moments filled with joy, laughter, and connection.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={handleBookExperience}>
              Book Your Experience
            </button>
            <button className="btn-secondary" onClick={() => setShowLearnMore(true)}>
              Learn More
            </button>
          </div>
          <p className="hero-limited-time">
          <i className="fi fi-rr-calendar"></i>
            Limited Time Event • Book Now
          </p>
        </div>
      </section>

      {/* Learn More Modal */}
      {showLearnMore && (
        <div className="modal-overlay" onClick={() => setShowLearnMore(false)}>
          <div className="modal-content learnmore-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLearnMore(false)}>×</button>
            <h2 className="learnmore-title">Discover More About Kiddovents</h2>

            <h3 className="learnmore-subtitle"><i className="fi fi-rr-lightbulb-on" aria-hidden="true" /> Event Ideas & Suggestions</h3>
            <div className="info-grid">
              <div className="info-card">
                <i className="fi fi-sr-birthday-cake" aria-hidden="true" />
                <h4>Themed Birthday Parties</h4>
                <p>Superhero, Princess, Science Lab, Space Adventure, Jungle Safari and more.</p>
              </div>
              <div className="info-card">
                <i className="fi fi-rr-flask" aria-hidden="true" />
                <h4>STEM & Discovery Days</h4>
                <p>Hands-on experiments, robotics challenges, and maker workshops for curious minds.</p>
              </div>
              <div className="info-card">
                <i className="fi fi-rr-palette" aria-hidden="true" />
                <h4>Art & Craft Camps</h4>
                <p>Painting, pottery, slime labs, DIY crafts, and keepsake projects to take home.</p>
              </div>
              <div className="info-card">
                <i className="fi fi-rr-trophy" aria-hidden="true" />
                <h4>Sports & Games</h4>
                <p>Mini-olympics, obstacle courses, dance-offs, treasure hunts, and friendly contests.</p>
              </div>
              <div className="info-card">
                <i className="fi fi-rr-movie" aria-hidden="true" />
                <h4>Movie & Pajama Nights</h4>
                <p>Cozy screens, snacks, beanbags, and themed costumes under safe supervision.</p>
              </div>
            </div>

            <h3 className="learnmore-subtitle"><i className="fi fi-rr-hand-holding-heart" aria-hidden="true" /> What We Offer</h3>
            <ul className="checklist">
              <li><i className="fi fi-sr-badge-check" aria-hidden="true" /> End‑to‑end planning and coordination</li>
              <li><i className="fi fi-sr-users-medical" aria-hidden="true" /> Trained child‑friendly facilitators and safety‑first staffing</li>
              <li><i className="fi fi-sr-magic-wand" aria-hidden="true" /> Decor, props, games, and theme customization</li>
              <li><i className="fi fi-sr-utensils" aria-hidden="true" /> Optional snacks, treats, and party packs</li>
              <li><i className="fi fi-sr-camera" aria-hidden="true" /> Photo moments and memory keepsakes</li>
            </ul>

            <h3 className="learnmore-subtitle"><i className="fi fi-rr-like" aria-hidden="true" /> Benefits of Booking with Us</h3>
            <ul className="checklist">
              <li><i className="fi fi-sr-shield-check" aria-hidden="true" /> Reliable, stress‑free planning handled by professionals</li>
              <li><i className="fi fi-sr-alarm-clock" aria-hidden="true" /> Time‑saving packages tailored to your budget</li>
              <li><i className="fi fi-sr-stars" aria-hidden="true" /> Magical experiences kids remember and talk about</li>
              <li><i className="fi fi-sr-map-marker" aria-hidden="true" /> Flexible locations: indoor, outdoor, or your venue</li>
              <li><i className="fi fi-sr-wallet" aria-hidden="true" /> Transparent pricing with secure MoMo checkout</li>
            </ul>

            <div className="learnmore-cta">
              <button className="btn-primary" onClick={handleBookExperience}>Choose a Package</button>
            </div>
          </div>
        </div>
      )}

      {/* About the Event Section */}
      <section className="about-section">
        <h2 className="section-title">About the Event</h2>
        <p className="section-description">
          In today's fast-paced world, the greatest gift we can give is our time. Join us for a celebration of togetherness, where families reconnect and create cherished memories that last a lifetime.
        </p>
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon purple-icon"><i className="fi fi-sr-heart" aria-hidden="true" /></div>
            <h3 className="feature-title">Family Bonding</h3>
            <p className="feature-text">Create lasting memories with activities designed to bring families closer together.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon purple-icon"><i className="fi fi-rr-users" aria-hidden="true" /></div>
            <h3 className="feature-title">Community Spirit</h3>
            <p className="feature-text">Connect with other families and build meaningful relationships in a welcoming environment.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon purple-icon"><i className="fi fi-rr-sparkles" aria-hidden="true" /></div>
            <h3 className="feature-title">Magical Experiences</h3>
            <p className="feature-text">Enjoy enchanting activities, entertainment, and surprises throughout the event.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon purple-icon"><i className="fi fi-rr-alarm-clock" aria-hidden="true" /></div>
            <h3 className="feature-title">Quality Time</h3>
            <p className="feature-text">Step away from screens and distractions to focus on what truly matters.</p>
          </div>
        </div>
      </section>

      {/* What to Expect Section */}
      <section className="expect-section">
        <div className="expect-content">
          <div className="expect-text">
            <h2 className="expect-title">What to Expect</h2>
            <ul className="expect-list">
              <li className="expect-item">✓ Interactive family activities and games</li>
              <li className="expect-item">✓ Live entertainment and performances</li>
              <li className="expect-item">✓ Delicious food and refreshments</li>
              <li className="expect-item">✓ Photo opportunities and keepsakes</li>
              <li className="expect-item">✓ Special surprises throughout the day</li>
            </ul>
          </div>
          <div className="expect-image">
            <div className="placeholder-image">
              <p><img src='images.jpg' alt='Kiddovents Logo' className='kiddovents-logo' width={600} height={430}/></p>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Modal */}
      {showPackagesModal && (
        <div className="modal-overlay" onClick={() => setShowPackagesModal(false)}>
          <div className="modal-content packages-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPackagesModal(false)}>×</button>
            <div className="packages-banner">
              <p>Special surprises throughout the day</p>
            </div>
            <h2 className="packages-title">Ticket Packages</h2>
            <p className="packages-subtitle">
              Choose the perfect package for your family and start creating unforgettable memories together.
            </p>
            <div className="packages-grid">
              {packages.map(pkg => (
                <div key={pkg.id} className={`package-card ${pkg.is_popular ? 'popular' : ''}`}>
                  {pkg.is_popular && (
                    <div className="popular-badge">Most Popular</div>
                  )}
                  <div className="package-icon">{getIcon(pkg.icon)}</div>
                  <h3 className="package-name">{pkg.name}</h3>
                  <p className="package-description">{pkg.description}</p>
                  <div className="package-price">
                    <span className="price-amount">${pkg.price}</span>
                    <span className="price-label">per package</span>
                  </div>
                  <ul className="package-features">
                    {pkg.features && pkg.features.split('|').map((feature, idx) => (
                      <li key={idx} className="package-feature">
                        <span className="checkmark">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button 
                    className="package-book-btn"
                    onClick={() => handlePackageSelect(pkg)}
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
            <div className="special-offer-banner">
              <p>
                Special Offer: Book before December 15th and receive a 15% early bird discount! Use code{' '}
                <span className="discount-code">TOGETHER2025</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && selectedPackage && (
        <div className="modal-overlay" onClick={handleCloseBookingForm}>
          <div className="modal-content booking-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseBookingForm}>×</button>
            <h2 className="booking-title">Complete Your Booking</h2>
            <div className="selected-package-info">
              <h3>{selectedPackage.name}</h3>
              <p className="selected-package-price">${selectedPackage.price}</p>
            </div>
            <form className="booking-form" onSubmit={handleSubmitBooking}>
              <div className="form-group">
                <label>Parent's Name *</label>
                <input
                  type="text"
                  required
                  value={bookingForm.parent_name}
                  onChange={(e) => setBookingForm({...bookingForm, parent_name: e.target.value})}
                  placeholder="Enter parent's full name"
                />
              </div>
              <div className="form-group">
                <label>Parent's Email *</label>
                <input
                  type="email"
                  required
                  value={bookingForm.parent_email}
                  onChange={(e) => setBookingForm({...bookingForm, parent_email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label>Parent's Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={bookingForm.parent_phone}
                  onChange={(e) => setBookingForm({...bookingForm, parent_phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label>Child's Name *</label>
                <input
                  type="text"
                  required
                  value={bookingForm.child_name}
                  onChange={(e) => setBookingForm({...bookingForm, child_name: e.target.value})}
                  placeholder="Enter child's name"
                />
              </div>
              <div className="form-group">
                <label>Age Range *</label>
                <select
                  required
                  value={bookingForm.age_range}
                  onChange={(e) => setBookingForm({...bookingForm, age_range: e.target.value})}
                >
                  <option value="">Select age range</option>
                  {ageRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Location *</label>
                <select
                  required
                  value={bookingForm.event_location}
                  onChange={(e) => setBookingForm({...bookingForm, event_location: e.target.value})}
                >
                  <option value="">Select location preference</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Briefly Describe the Event</label>
                <textarea
                  value={bookingForm.event_description}
                  onChange={(e) => setBookingForm({...bookingForm, event_description: e.target.value})}
                  placeholder="Tell us about the event you'd like to create..."
                  rows="4"
                />
              </div>
              <button 
                type="submit" 
                className="checkout-btn"
                disabled={loading}
              >
                {loading ? 'Processing...' : `Checkout with MoMo - $${selectedPackage.price}`}
              </button>
              {bookingStatus === 'pending' && (
                <p className="booking-message pending">Processing your booking...</p>
              )}
              {bookingStatus === 'success' && (
                <p className="booking-message success">
                  Booking created successfully! Payment has been initiated. Check your phone for MoMo payment prompt.
                </p>
              )}
              {bookingStatus === 'error' && (
                <p className="booking-message error">
                  Booking failed. Please try again later.
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
