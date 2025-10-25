-- Create tables for file search application

CREATE TABLE IF NOT EXISTS search_sessions (
    id SERIAL PRIMARY KEY,
    search_term VARCHAR(500) NOT NULL,
    search_path VARCHAR(1000) NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    total_files_searched INTEGER DEFAULT 0,
    total_matches INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'running'
);

CREATE TABLE IF NOT EXISTS search_results (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES search_sessions(id) ON DELETE CASCADE,
    file_path VARCHAR(2000) NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    match_count INTEGER DEFAULT 0,
    is_zip_file BOOLEAN DEFAULT FALSE,
    zip_parent_path VARCHAR(2000),
    found_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    preview_text TEXT
);

CREATE TABLE IF NOT EXISTS match_details (
    id SERIAL PRIMARY KEY,
    result_id INTEGER REFERENCES search_results(id) ON DELETE CASCADE,
    line_number INTEGER,
    line_content TEXT,
    match_position INTEGER,
    context_before TEXT,
    context_after TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_search_sessions_status ON search_sessions(status);
CREATE INDEX IF NOT EXISTS idx_search_results_session ON search_results(session_id);
CREATE INDEX IF NOT EXISTS idx_search_results_file_path ON search_results(file_path);
CREATE INDEX IF NOT EXISTS idx_match_details_result ON match_details(result_id);