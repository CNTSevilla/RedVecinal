-- Trigger para mantener assists_count actualizado
DELIMITER //
CREATE TRIGGER trg_assists_insert
AFTER INSERT ON assists
FOR EACH ROW
BEGIN
  UPDATE alertas SET assists_count = assists_count + 1 WHERE id = NEW.alert_id;
END//

CREATE TRIGGER trg_assists_delete
AFTER DELETE ON assists
FOR EACH ROW
BEGIN
  UPDATE alertas SET assists_count = assists_count - 1 WHERE id = OLD.alert_id;
END//

DELIMITER ;
