create policy "Users can remove their own classes"
  on public.classes for delete to authenticated
  using ((select auth.uid()) = user_id);
