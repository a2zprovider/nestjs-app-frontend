<script>
  import "../app.css";
  import "../styles/main.css";
  import { onMount } from "svelte";
  import jQuery from "jquery";
  import { goto } from "$app/navigation";

  let tokenExpired = false;

  function isTokenExpired(token) {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiry = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      return now >= expiry;
    } catch (error) {
      console.error("Error decoding token:", error);
      return true;
    }
  }

  onMount(() => {
    window.$ = jQuery;
    window.jQuery = jQuery;

    const token = localStorage.getItem("access_token");
    tokenExpired = isTokenExpired(token);
    if (tokenExpired) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      goto("/login");
    } else {
    }
  });
  import { setupBootstrapHandlers } from "$lib/utils/js/bootstrapHandlers.js";

  onMount(() => {
    setupBootstrapHandlers();
  });
</script>

<main class="main-wrapper min-h-screen bg-gray-50">
  <slot />
</main>
