
ALTER FUNCTION public.expert_role_for_type(public.consultation_type) SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_roles(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.expert_role_for_type(public.consultation_type) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_roles(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.expert_role_for_type(public.consultation_type) TO authenticated;
