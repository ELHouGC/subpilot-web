
import { defineStore } from "pinia";
import { ref } from "vue";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const initialized = ref(false);
  const loading = ref(false);

  async function initialize() {
    if (initialized.value) return;

    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    session.value = data.session;
    user.value = data.session?.user ?? null;

    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession;
      user.value = newSession?.user ?? null;
    });

    initialized.value = true;
  }

  async function signUp(email: string, password: string) {
    loading.value = true;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return data;
    } finally {
      loading.value = false;
    }
  }

  async function signIn(email: string, password: string) {
    loading.value = true;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return data;
    } finally {
      loading.value = false;
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  }

  return {
    user,
    session,
    initialized,
    loading,
    initialize,
    signUp,
    signIn,
    signOut,
  };
});
