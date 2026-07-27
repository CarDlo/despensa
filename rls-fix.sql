-- =============================================
-- FIX: Agregar políticas de UPDATE y DELETE
-- Pega esto en el SQL Editor de Supabase y RUN
-- https://supabase.com/dashboard/project/akxqzvznhredtsuuphyo/sql/new
-- =============================================

-- Permitir actualizar cualquier producto
CREATE POLICY "Actualización pública" ON productos
  FOR UPDATE USING (true) WITH CHECK (true);

-- Permitir eliminar cualquier producto  
CREATE POLICY "Eliminación pública" ON productos
  FOR DELETE USING (true);
