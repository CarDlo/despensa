-- =============================================
-- Configuración inicial de la base de datos
-- Pega esto en el SQL Editor de Supabase
-- https://supabase.com/dashboard/project/akxqzvznhredtsuuphyo/sql/new
-- =============================================

-- 1. Crear tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL,
  categoria text NOT NULL DEFAULT 'otros',
  tiene boolean DEFAULT true,
  nota text DEFAULT '',
  cantidad text DEFAULT '',
  creado_por text DEFAULT 'web',
  created_at timestamptz DEFAULT now()
);

-- 2. Activar Row Level Security
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- 3. Permitir lectura anónima (para que la web pública pueda leer)
CREATE POLICY "Lectura pública" ON productos
  FOR SELECT USING (true);

-- 4. Permitir inserción anónima (para que cualquiera pueda agregar desde la web)
CREATE POLICY "Inserción pública" ON productos
  FOR INSERT WITH CHECK (true);

-- 5. Insertar los productos de la despensa actual
INSERT INTO productos (nombre, categoria, tiene, nota, cantidad) VALUES
  ('Pepino Cohombro', 'verduras', true, '0.412 kg', ''),
  ('Zanahoria', 'verduras', true, '0.934 kg', ''),
  ('Brócoli', 'verduras', true, '0.188 kg', ''),
  ('Cilantro', 'verduras', true, 'Manojo', ''),
  ('Cilantro Cimarrón', 'verduras', true, '0.094 kg', ''),
  ('Cebolla Larga', 'verduras', true, '1.598 kg', ''),
  ('Auyama', 'verduras', true, 'Calabaza, 0.796 kg', ''),
  ('Cebolla Cabezona Blanca', 'verduras', true, '1.108 kg', ''),
  ('Pimentón Rojo', 'verduras', true, '0.398 kg', ''),
  ('Habichuela', 'verduras', true, 'Ejotes, 0.368 kg', ''),
  ('Arveja Verde', 'verduras', true, 'Guisantes con cáscara, 0.618 kg', ''),
  ('Berenjena', 'verduras', true, '', ''),
  ('Espinaca', 'verduras', true, '0.444 kg', ''),
  ('Mazorca Bogotana', 'verduras', true, '0.784 kg', ''),
  ('Papa Amarilla', 'verduras', true, '0.630 kg', ''),
  ('Papa Pastusa', 'verduras', true, 'Bolsa 2.5 kg', ''),
  ('Plátano Verde', 'verduras', true, '1.378 kg', ''),
  ('Papa Rapi Tradicional McCain', 'congelados', true, '1.2 kg', ''),
  ('Vegetales Mixtos McCain', 'congelados', true, '500g', ''),
  ('Tostado Guadalupe', 'snacks', true, '280g, 24 uds', ''),
  ('Gall Saltín', 'snacks', true, '300g', ''),
  ('Vitagranola Coco', 'snacks', true, '908g', ''),
  ('Ajo', 'condimentos', true, '0.332 kg', ''),
  ('Granadilla', 'frutas', true, '1.190 kg', ''),
  ('Limón Tahití', 'frutas', true, '1.046 kg', ''),
  ('Mango', 'frutas', true, '0.824 kg', ''),
  ('Sandía Baby', 'frutas', true, '2.238 kg', ''),
  ('Papaya Común', 'frutas', true, '2.626 kg', ''),
  ('Tomate Chonto', 'frutas', true, '1.492 kg', ''),
  ('Arándanos Cocinerito', 'frutas', true, '50g', ''),
  ('Ciruela Cocinerito', 'frutas', true, '100g', ''),
  ('Uva Pasas Cocinerito', 'frutas', true, '200g', ''),
  ('Colanta Queso Costeño', 'lacteos', true, '500 g', ''),
  ('Colanta Queso Crema', 'lacteos', true, '230 g', ''),
  ('Tostao Café Molido Selecto', 'cafe', true, '454 g', ''),
  ('Aromat Flor Jamaica', 'bebidas', true, '45g', ''),
  ('Hindú Té Verde Moringa', 'bebidas', true, '46 g', ''),
  ('Incauca Azúcar Morena', 'despensa', true, '1000 g', ''),
  ('Florhuila Arroz', 'granos', true, '5 kg', ''),
  ('Frijoles', 'granos', true, 'Para los viernes', ''),
  ('Zenú Atún Lomo en Aceite', 'proteinas', true, '160 g x 2 latas', ''),
  ('Carne para pitar', 'proteinas', true, '2 kg', ''),
  ('Pechuga de pollo', 'proteinas', true, '2 enteras + 1 abierta', ''),
  ('Costilla de cerdo', 'proteinas', true, '', ''),
  ('Carne de cerdo', 'proteinas', true, 'Para los viernes', ''),
  ('Pescado', 'proteinas', true, '', ''),
  ('Aceite Popular Soya', 'aceites', true, '3 litros', ''),
  ('Servilletas Popular', 'limpieza', true, '20 uds', ''),
  ('Papel Higiénico Familia', 'limpieza', true, '355m, 12 rollos', ''),
  ('Lavaloza Bond', 'limpieza', true, '3000g Crema', ''),
  ('Shampoo Herbal Rosa Mosqueta', 'cuidado_personal', true, '240ml', ''),
  ('Insect Raid Zancudos', 'limpieza', true, '400ml', ''),
  ('Esponja Eterna PG2', 'limpieza', true, 'Acero inoxidable', ''),
  ('Bolsa Plástica Biodegradable', 'limpieza', true, 'Manigueta', ''),
  ('Bolsa Impresa Rollo Eco', 'limpieza', true, '30 uds x 2', ''),
  ('Película Adherente El Sol', 'limpieza', true, '50m', ''),
  ('Differ Papel Aluminio', 'limpieza', true, '7 m', ''),
  ('Domingo Molde Aluminio Lasaña', 'limpieza', true, '2 uds', '')
ON CONFLICT DO NOTHING;
