import { supabase } from "./supabase/client";

export const getSessionUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user ?? null;
};

export const ensureProfile = async (user) => {
  if (!user) return null;
  console.log("[ensureProfile] 프로필 확인 시작:", user.id);

  const { data: existing, error } = await supabase
    .from("profiles")
    .select("id, role, plan")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[ensureProfile] 프로필 조회 오류 (400 발생 가능 지점):", error);
    // 테이블이 없거나 권한이 없는 경우(400/404)를 대비해 에러를 던지지 않고 null 반환
    if (error.code === 'PGRST116' || error.message?.includes('relation "profiles" does not exist')) {
      console.warn("[ensureProfile] profiles 테이블이 존재하지 않는 것 같습니다. 수동 생성이 필요합니다.");
    }
    return null;
  }

  if (!existing) {
    console.log("[ensureProfile] 기존 프로필 없음, 신규 생성 시도");
    const { data: created, error: insertError } = await supabase
      .from("profiles")
      .insert({ id: user.id })
      .select("id, role, plan")
      .single();
    
    if (insertError) {
      console.error("[ensureProfile] 프로필 생성 오류:", insertError);
      return null;
    }
    console.log("[ensureProfile] 신규 프로필 생성 완료:", created);
    return created ?? null;
  }

  console.log("[ensureProfile] 기존 프로필 확인됨:", existing);
  return existing;
};

export const getProfile = async () => {
  const user = await getSessionUser();
  if (!user) return null;
  return ensureProfile(user);
};

export const isAdmin = async () => {
  const profile = await getProfile();
  return profile?.role === "admin";
};

export const signInWithEmail = async (email, password) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUpWithEmail = async (email, password) => {
  return supabase.auth.signUp({ email, password });
};

export const signOut = async () => {
  return supabase.auth.signOut({ scope: "local" });
};
