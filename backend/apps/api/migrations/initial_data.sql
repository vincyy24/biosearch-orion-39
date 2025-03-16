
-- This file contains SQL statements to initialize the database with data
-- that was previously hardcoded in the application

-- Publications Table
-- Previously hardcoded in api/views.py PublicationList class
CREATE TABLE IF NOT EXISTS publications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    year INTEGER NOT NULL,
    citations INTEGER NOT NULL
);

-- Insert publications data that was previously hardcoded
INSERT INTO publications (title, author, year, citations) VALUES
    ('Advancements in Genomic Research', 'Dr. Jane Smith', 2023, 45),
    ('Clinical Applications of CRISPR', 'Dr. John Doe', 2022, 78),
    ('New Frontiers in Cancer Treatment', 'Dr. Sarah Johnson', 2023, 32),
    ('Biomarkers for Early Disease Detection', 'Dr. Michael Chen', 2021, 102),
    ('Machine Learning in Drug Discovery', 'Dr. Emily Brown', 2022, 64);

-- Data Types Table
-- Previously hardcoded in api/views.py DataTypesList class
CREATE TABLE IF NOT EXISTS data_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Insert data types that were previously hardcoded
INSERT INTO data_types (id, name) VALUES
    ('protein', 'Protein'),
    ('genome', 'Genome'),
    ('pathway', 'Pathway'),
    ('dataset', 'Dataset'),
    ('voltammetry', 'Voltammetry Data');

-- File Uploads Table
-- For storing file uploads (previously only handled in memory)
CREATE TABLE IF NOT EXISTS file_uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    data_type TEXT NOT NULL,
    description TEXT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY (data_type) REFERENCES data_types(id),
    FOREIGN KEY (user_id) REFERENCES auth_user(id)
);
