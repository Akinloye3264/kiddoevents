-- Table for events
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    location VARCHAR(255),
    image_url VARCHAR(255)
);

-- Table for bookings
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NULL,
    child_name VARCHAR(255) NOT NULL,
    parent_email VARCHAR(255) NOT NULL,
    parent_phone VARCHAR(50),
    payment_reference VARCHAR(128),
    paid TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmation_code VARCHAR(50) UNIQUE,
    age_range VARCHAR(20),
    event_location VARCHAR(40),
    package_id INT,
    parent_name VARCHAR(255),
    event_description TEXT,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- Table for packages
CREATE TABLE IF NOT EXISTS packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    icon VARCHAR(50),
    features TEXT,
    is_popular TINYINT(1) DEFAULT 0,
    max_people INT DEFAULT 4
);

-- Insert packages matching Figma design
INSERT INTO packages (name, description, price, icon, features, is_popular, max_people) VALUES
('Family Fun Pass', 'Perfect for families looking to create special memories', 49.00, 'heart', 'Admission for up to 4 people|Access to all activities|Welcome gift bag|Event program guide', 0, 4),
('Season Of Joy Bundle', 'Enhanced experience with exclusive perks', 89.00, 'star', 'Admission for up to 4 people|Access to all activities|Priority seating for shows|Complimentary refreshments|Premium gift bag|Professional family photo', 1, 4),
('Weekend Warriors', 'The ultimate family experience with luxury touches', 149.00, 'crown', 'Admission for up to 6 people|Access to all activities|VIP lounge access|Reserved premium seating|Full meal package included|Exclusive VIP gift package|Professional photo session|Meet & greet opportunities', 0, 6);
