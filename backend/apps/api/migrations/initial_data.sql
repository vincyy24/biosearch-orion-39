-- ========================================
-- ORION Database Schema (Open Repository for Integrated Electrochemical Observation & Networking)
-- ========================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'researcher', 'reviewer', 'contributor', 'user')) NOT NULL DEFAULT 'user',
    profile_photo TEXT,
    phone TEXT,
    secondary_email TEXT,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT 0
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    theme TEXT DEFAULT 'light',
    layout_density TEXT DEFAULT 'normal',
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

-- Research Library Table
CREATE TABLE IF NOT EXISTS research_library (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    research_title TEXT NOT NULL,
    research_doi TEXT,
    research_url TEXT,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User Analytics Table
CREATE TABLE IF NOT EXISTS user_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    search_count INTEGER DEFAULT 0,
    saved_items_count INTEGER DEFAULT 0,
    tools_used TEXT,
    research_hours REAL DEFAULT 0.0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Contact Support Table
CREATE TABLE IF NOT EXISTS contact_support (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Instruments Table
CREATE TABLE IF NOT EXISTS instruments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- Electrodes Table
CREATE TABLE IF NOT EXISTS electrodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT UNIQUE NOT NULL
);

-- Methods Table
CREATE TABLE IF NOT EXISTS methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- Voltammetry Techniques Table
CREATE TABLE IF NOT EXISTS voltammetry_techniques (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- Publications Table
CREATE TABLE IF NOT EXISTS publications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    doi TEXT UNIQUE NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT 0,
    publication_data TEXT,
    thumbnail TEXT,
    access_level TEXT CHECK(access_level IN ('public', 'private')) DEFAULT 'private',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Experiments Table
CREATE TABLE IF NOT EXISTS experiments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    research_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    researcher_id INTEGER NOT NULL,
    method_id INTEGER NOT NULL,
    electrode_id INTEGER NOT NULL,
    instrument_id INTEGER NOT NULL,
    voltammetry_technique_id INTEGER,
    method_parameters TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (researcher_id) REFERENCES users(id),
    FOREIGN KEY (method_id) REFERENCES methods(id),
    FOREIGN KEY (electrode_id) REFERENCES electrodes(id),
    FOREIGN KEY (instrument_id) REFERENCES instruments(id),
    FOREIGN KEY (voltammetry_technique_id) REFERENCES voltammetry_techniques(id)
);

-- Files Table
CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    data_type TEXT,
    data_category TEXT,
    access_level TEXT CHECK(access_level IN ('public', 'private')) DEFAULT 'private',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id)
);

-- Research Collaborators Table
CREATE TABLE IF NOT EXISTS research_collaborators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    research_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    permission_level TEXT CHECK(permission_level IN ('read', 'write', 'admin')) NOT NULL DEFAULT 'read',
    FOREIGN KEY (research_id) REFERENCES experiments(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- DOI Verification Log Table
CREATE TABLE IF NOT EXISTS doi_verification_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    publication_id INTEGER NOT NULL,
    doi TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT 0,
    verification_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (publication_id) REFERENCES publications(id)
);

-- Insert Default Methods
INSERT INTO methods (name) VALUES ('Cyclic'), ('Constant'), ('Square wave');

-- Insert Default Electrodes
INSERT INTO electrodes (type) VALUES ('Glassy Carbon'), ('Platinum'), ('Gold');

-- Insert Default Instruments
INSERT INTO instruments (name) VALUES ('Autolab PGSTAT'), ('CHI Electrochemical Workstation'), ('Gamry Potentiostat');
