CREATE TABLE IF NOT EXISTS alertas (
  id            CHAR(36) PRIMARY KEY,
  lat           DOUBLE NOT NULL,
  lng           DOUBLE NOT NULL,
  severity      ENUM('sospechoso','tension','agresion_verbal','riesgo_fisico','emergencia') NOT NULL,
  description   TEXT NOT NULL,
  num_people    INT DEFAULT NULL,
  direction     VARCHAR(255) DEFAULT '',
  appearance    VARCHAR(255) DEFAULT '',
  duration      ENUM('min15','hour1','hours6','hours24') NOT NULL,
  expires_at    DATETIME NOT NULL,
  fingerprint_hash VARCHAR(64) NOT NULL,
  status        ENUM('active','cleared','false_alarm') NOT NULL DEFAULT 'active',
  assists_count INT NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_expires (expires_at),
  INDEX idx_status (status),
  INDEX idx_fingerprint (fingerprint_hash),
  INDEX idx_location (lat, lng)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS assists (
  id              CHAR(36) PRIMARY KEY,
  alert_id        CHAR(36) NOT NULL,
  fingerprint_hash VARCHAR(64) NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_alert_fp (alert_id, fingerprint_hash),
  FOREIGN KEY (alert_id) REFERENCES alertas(id) ON DELETE CASCADE,
  INDEX idx_alert (alert_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS migrations (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(255) NOT NULL UNIQUE,
  run_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO migrations (name) VALUES ('00001_schema');
