<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { supabase } from "@/lib/supabase";

const authStore = useAuthStore();

const fullName = ref("");
const email = ref("");
const password = ref("");

const errorMessage = ref("");
const successMessage = ref("");

async function handleSignUp() {
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const { user, session } = await authStore.signUp(
      email.value.trim(),
      password.value,
      fullName.value.trim(),
    );

    if (!user) {
      throw new Error("Registration did not return a user.");
    }
    if (session) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      successMessage.value = `RLS test passed! Welcome, ${profile.full_name}.`;
    } else {
      successMessage.value =
        "Account created. Confirm your email and sign in to test profile access.";
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Something went wrong.";
  }
}

async function handleSignInAndTestRls() {
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const { user } = await authStore.signIn(
      email.value.trim(),
      password.value,
    );

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    successMessage.value = `RLS test passed! Welcome, ${profile.full_name}.`;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Something went wrong.";
  }
}
</script>

<template>
  <main class="signup-container">
    <h1>SubPilot</h1>
    <h2>Create an account</h2>

    <form @submit.prevent="handleSignUp">
      <label for="fullName">Full name</label>
      <input
        id="fullName"
        v-model="fullName"
        type="text"
        autocomplete="name"
        required
      />

      <label for="email">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        autocomplete="email"
        required
      />

      <label for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        autocomplete="new-password"
        minlength="6"
        required
      />

      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? "Creating account..." : "Sign up" }}
      </button>
      <button
        type="button"
        :disabled="authStore.loading"
        @click="handleSignInAndTestRls"
      >
        Sign in & test RLS
      </button>
    </form>

    <p v-if="errorMessage" class="error">
      {{ errorMessage }}
    </p>

    <p v-if="successMessage" class="success">
      {{ successMessage }}
    </p>
  </main>
</template>

<style scoped>
.signup-container {
  max-width: 400px;
  margin: 80px auto;
  padding: 24px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

button {
  padding: 12px;
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.error {
  color: #dc2626;
}

.success {
  color: #16a34a;
}
</style>