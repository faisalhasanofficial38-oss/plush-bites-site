
CREATE POLICY "gallery-media admin all" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'gallery-media' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id = 'gallery-media' AND public.has_role(auth.uid(),'admin'));
