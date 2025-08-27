<script>
  import { setUser } from "../../stores/userStore";
  import { onMount } from "svelte";
  import { checkAuth } from "$lib/utils/auth";

  import { goto } from "$app/navigation";
  import { apiFetch } from "$lib/api/client";
  import { errorHandle } from "$lib/utils/errorHandle";
  import { API_ROUTES } from "$lib/constants/apiRoutes";
  import Swal from "sweetalert2";

  let email = "";
  let password = "";
  let rememberMe = false;
  let errorMessage = "";
  let loading = false;

  onMount(() => {
    if (checkAuth()) {
      goto("/dashboard");
    }
  });

  const handleSubmit = async (event) => {
    errorMessage = "";
    loading = true;
    event.preventDefault();

    if (!email || !password) {
      errorMessage = "Please fill in all fields.";
      loading = false;
      return;
    }

    try {
      const data = await apiFetch(API_ROUTES.LOGIN, {
        method: "POST",
        data: JSON.stringify({ email, password }),
      });
      Swal.fire("Success!", 'Sign in successfully.', "success");
      // Store token and user info
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      if (rememberMe) {
        // Optional: Implement remember-me logic
      }

      goto("/dashboard");
    } catch (error) {
      console.log("error : ", error);
      errorMessage = errorHandle(error);
    } finally {
      loading = false;
    }
  };
</script>

<div class="flex justify-center items-center min-h-screen bg-gray-100">
  <form
    class="bg-white p-8 rounded-lg shadow-md w-96"
    on:submit|preventDefault={handleSubmit}
  >
    <h2 class="text-2xl font-bold text-center text-gray-700">Sign In</h2>
    <p class="text-center text-gray-500 mb-4">
      Access the CRMS panel using your email and passcode.
    </p>

    {#if errorMessage}
      <p class="text-red-500 text-sm text-center">{errorMessage}</p>
    {/if}

    <div class="mb-4">
      <label for="email" class="block text-sm font-medium text-gray-700"
        >Email Address</label
      >
      <input
        type="email"
        id="email"
        class="mt-1 p-3 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        placeholder="Email Address"
        bind:value={email}
        required
      />
    </div>

    <div class="mb-4">
      <label for="password" class="block text-sm font-medium text-gray-700"
        >Password</label
      >
      <input
        type="password"
        id="password"
        class="mt-1 p-3 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        placeholder="Password"
        bind:value={password}
        required
      />
    </div>

    <div class="flex items-center mb-4">
      <input
        type="checkbox"
        id="rememberMe"
        class="h-4 w-4 text-blue-500 border-gray-300 rounded"
        bind:checked={rememberMe}
      />
      <label for="rememberMe" class="ml-2 text-sm text-gray-700"
        >Remember Me</label
      >
    </div>

    <button
      type="submit"
      class="w-full p-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
      disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button
    >

    <p class="text-center text-sm text-gray-500 mt-4">
      <a href="#ForgotPassword" class="text-red-500 hover:text-red-600"
        >Forgot Password?</a
      >
    </p>

    <!-- <p class="text-center text-sm text-gray-500 mt-2">
      New on our platform? <a
        href="/register"
        class="text-blue-500 hover:text-blue-600">Create an account</a
      >
    </p> -->
  </form>
</div>

<style>
  /* Optionally, add custom styles here */
</style>
