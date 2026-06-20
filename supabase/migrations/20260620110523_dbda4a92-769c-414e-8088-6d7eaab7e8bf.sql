
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Storage policies for menu-images bucket
CREATE POLICY "Public read menu-images" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'menu-images');
CREATE POLICY "Admins upload menu-images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'menu-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update menu-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'menu-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete menu-images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'menu-images' AND public.has_role(auth.uid(), 'admin'));
