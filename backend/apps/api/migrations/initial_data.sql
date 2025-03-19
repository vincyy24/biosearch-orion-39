-- ========================================
-- Updated Initial Data Schema for biosearch-hub
-- ========================================

-- Users Table: Extended with profile_photo, phone, secondary_email, and two_factor_enabled
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'reviewer', 'contributor', 'user')) NOT NULL DEFAULT 'user',
    profile_photo TEXT,
    phone TEXT,
    secondary_email TEXT,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT 0
);

-- User Settings Table: Appearance and Data Privacy Settings
CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    theme TEXT DEFAULT 'light', -- e.g., 'light' or 'dark'
    layout_density TEXT DEFAULT 'normal', -- e.g., 'compact', 'normal'
    font_size INTEGER DEFAULT 14,
    show_welcome_screen BOOLEAN NOT NULL DEFAULT 1,
    data_visibility TEXT CHECK(data_visibility IN ('public', 'private')) DEFAULT 'private',
    share_research_interests BOOLEAN NOT NULL DEFAULT 0,
    show_activity_status BOOLEAN NOT NULL DEFAULT 0,
    data_usage_consent BOOLEAN NOT NULL DEFAULT 0,
    analytics_opt_in BOOLEAN NOT NULL DEFAULT 0,
    personalization_opt_in BOOLEAN NOT NULL DEFAULT 0,
    export_all_data BOOLEAN NOT NULL DEFAULT 0,
    request_data_deletion BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Research Library Table: For saving research papers
CREATE TABLE IF NOT EXISTS research_library (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    research_title TEXT NOT NULL,
    research_doi TEXT,
    research_url TEXT,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User Analytics Table: To store user activity metrics
CREATE TABLE IF NOT EXISTS user_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    search_count INTEGER DEFAULT 0,
    saved_items_count INTEGER DEFAULT 0,
    tools_used TEXT, -- Could be JSON or comma-separated list
    research_hours REAL DEFAULT 0.0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Notifications Table: To store user notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Contact Support Table: To store support requests from users
CREATE TABLE IF NOT EXISTS contact_support (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Instruments Table: For storing instrument details
CREATE TABLE IF NOT EXISTS instruments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- Electrodes Table: For storing electrode types
CREATE TABLE IF NOT EXISTS electrodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT UNIQUE NOT NULL
);

-- Methods Table: For experiment methodologies
CREATE TABLE IF NOT EXISTS methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- Experiments Table: Main table for experiment metadata
CREATE TABLE IF NOT EXISTS experiments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    researcher_id INTEGER NOT NULL,
    method_id INTEGER NOT NULL,
    electrode_id INTEGER NOT NULL,
    instrument_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('published', 'peer_review', 'research', 'other')) NOT NULL DEFAULT 'research',
    method_parameters TEXT, -- JSON text to store variable parameters per methodology
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (researcher_id) REFERENCES users(id),
    FOREIGN KEY (method_id) REFERENCES methods(id),
    FOREIGN KEY (electrode_id) REFERENCES electrodes(id),
    FOREIGN KEY (instrument_id) REFERENCES instruments(id)
);

-- Files Table: For file uploads associated with experiments
CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    data_type TEXT, -- e.g., 'potentiostat data'
    data_category TEXT, -- e.g., published, under research, etc.
    access_level TEXT CHECK(access_level IN ('public', 'private')) DEFAULT 'private',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id)
);

-- Upload Method Parameters Table: To store extra parameters for each experiment based on method
CREATE TABLE IF NOT EXISTS upload_method_parameters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id INTEGER NOT NULL,
    parameter_name TEXT NOT NULL,
    parameter_value TEXT NOT NULL,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id)
);

-- DOI Verification Log: To log DOI verification during upload
CREATE TABLE IF NOT EXISTS doi_verification_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id INTEGER NOT NULL,
    doi TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT 0,
    verification_response TEXT,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (experiment_id) REFERENCES experiments(id)\n);

-- Default Data Inserts

-- Insert default methods
INSERT INTO methods (name) VALUES ('Cyclic'), ('Constant'), ('Square wave');

-- Insert default electrodes
INSERT INTO electrodes (type) VALUES ('Glassy Carbon'), ('Platinum'), ('Gold');

-- Insert default instruments
INSERT INTO instruments (name) VALUES ('Autolab PGSTAT'), ('CHI Electrochemical Workstation'), ('Gamry Potentiostat');

-- Insert sample publications (existing sample data)
CREATE TABLE IF NOT EXISTS publications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    year INTEGER NOT NULL,
    citations INTEGER NOT NULL
);
INSERT INTO publications (title, author, year, citations) VALUES
    ('Advancements in Genomic Research', 'Dr. Jane Smith', 2023, 45),
    ('Clinical Applications of CRISPR', 'Dr. John Doe', 2022, 78),
    ('New Frontiers in Cancer Treatment', 'Dr. Sarah Johnson', 2023, 32),
    ('Biomarkers for Early Disease Detection', 'Dr. Michael Chen', 2021, 102),
    ('Machine Learning in Drug Discovery', 'Dr. Emily Brown', 2022, 64);

-- End of initial_data.sql
