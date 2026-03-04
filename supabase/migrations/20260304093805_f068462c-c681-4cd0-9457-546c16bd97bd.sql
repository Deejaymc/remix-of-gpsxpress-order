
-- Drop existing restrictive policies and recreate with admin access

-- CLIENTS
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;

CREATE POLICY "Users can view clients" ON public.clients FOR SELECT USING (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can insert clients" ON public.clients FOR INSERT WITH CHECK (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can update clients" ON public.clients FOR UPDATE USING (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
) WITH CHECK (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can delete clients" ON public.clients FOR DELETE USING (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);

-- PRODUCTS
DROP POLICY IF EXISTS "Users can view own products" ON public.products;
DROP POLICY IF EXISTS "Users can insert own products" ON public.products;
DROP POLICY IF EXISTS "Users can update own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete own products" ON public.products;

CREATE POLICY "Users can view products" ON public.products FOR SELECT USING (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can insert products" ON public.products FOR INSERT WITH CHECK (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can update products" ON public.products FOR UPDATE USING (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
) WITH CHECK (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can delete products" ON public.products FOR DELETE USING (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);

-- TECHNICIANS
DROP POLICY IF EXISTS "Users can view own technicians" ON public.technicians;
DROP POLICY IF EXISTS "Users can insert own technicians" ON public.technicians;
DROP POLICY IF EXISTS "Users can update own technicians" ON public.technicians;
DROP POLICY IF EXISTS "Users can delete own technicians" ON public.technicians;

CREATE POLICY "Users can view technicians" ON public.technicians FOR SELECT USING (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can insert technicians" ON public.technicians FOR INSERT WITH CHECK (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can update technicians" ON public.technicians FOR UPDATE USING (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
) WITH CHECK (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can delete technicians" ON public.technicians FOR DELETE USING (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);

-- SERVICE ORDERS
DROP POLICY IF EXISTS "Users can view own orders" ON public.service_orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.service_orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.service_orders;
DROP POLICY IF EXISTS "Users can delete own orders" ON public.service_orders;

CREATE POLICY "Users can view orders" ON public.service_orders FOR SELECT USING (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can insert orders" ON public.service_orders FOR INSERT WITH CHECK (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can update orders" ON public.service_orders FOR UPDATE USING (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
) WITH CHECK (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can delete orders" ON public.service_orders FOR DELETE USING (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);

-- COMPANY SETTINGS
DROP POLICY IF EXISTS "Users can view own company" ON public.company_settings;
DROP POLICY IF EXISTS "Users can insert own company" ON public.company_settings;
DROP POLICY IF EXISTS "Users can update own company" ON public.company_settings;

CREATE POLICY "Users can view company" ON public.company_settings FOR SELECT USING (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can insert company" ON public.company_settings FOR INSERT WITH CHECK (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can update company" ON public.company_settings FOR UPDATE USING (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
) WITH CHECK (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
