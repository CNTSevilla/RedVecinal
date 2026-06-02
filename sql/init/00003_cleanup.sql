-- Evento: limpiar alertas expiradas cada hora
DELIMITER //
CREATE EVENT IF NOT EXISTS clean_expired_alerts
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
  DELETE FROM alertas WHERE expires_at < NOW();
END//

DELIMITER ;
