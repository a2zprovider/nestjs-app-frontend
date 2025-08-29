<script>
  import { onMount } from "svelte";
  import jQuery from "jquery";
  import { goto } from "$app/navigation";
  import { clearUser } from "../../stores/userStore";
  import { checkAuth, logoutUser } from "$lib/utils/auth";
  import Swal from "sweetalert2";

  let currentUser;
  onMount(() => {
    currentUser = checkAuth();
    if (!currentUser) {
      goto("/login");
    }
  });

  const logout = () => {
    Swal.fire({
      title: "Sign Out Confirmation",
      text: "Are you sure you want to sign out this account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, sign out it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        clearUser();
        logoutUser();
        Swal.fire("Success!", "Sign out successfully.", "success");
        goto("/login");
      }
    });
  };

  onMount(() => {
    const $ = jQuery;
    const collapseHeader = $("#collapse-header");
    if (collapseHeader.length > 0) {
      document
        .getElementById("collapse-header")
        .addEventListener("click", function () {
          this.classList.toggle("active");
          document.body.classList.toggle("header-collapse");
        });
    }

    // $(document).on("click", function (e) {
    //   const dropdown = $(".profile-dropdown");
    //   const menu = dropdown.find(".dropdown-menu");

    //   if (dropdown.is(e.target) || dropdown.has(e.target).length > 0) {
    //     menu.toggleClass("show");
    //   } else {
    //     menu.removeClass("show");
    //   }
    // });

    $(document).on("click", "#toggle_btn, #toggle_btn2", function () {
      const body = $("body");
      const html = $("html");
      const isMini = body.hasClass("mini-sidebar");
      const isFullWidth = html.attr("data-layout") === "full-width";
      const isHidden = html.attr("data-layout") === "hidden";

      if (isMini) {
        body.removeClass("mini-sidebar");
        $(this).addClass("active");
        localStorage.setItem("screenModeNightTokenState", "night");
        setTimeout(() => $(".header-left").addClass("active"), 100);
      } else {
        body.addClass("mini-sidebar");
        $(this).removeClass("active");
        localStorage.removeItem("screenModeNightTokenState");
        setTimeout(() => $(".header-left").removeClass("active"), 100);
      }

      if (isFullWidth) {
        body.addClass("full-width").removeClass("mini-sidebar");
        $(".sidebar-overlay").addClass("opened");
        $(document).on("click", ".sidebar-close", () =>
          $("body").removeClass("full-width")
        );
      } else {
        body.removeClass("full-width");
      }

      if (isHidden) {
        body.toggleClass("hidden-layout").removeClass("mini-sidebar");
        $(document).on("click", ".sidebar-close", () =>
          $("body").removeClass("full-width")
        );
      }

      return false;
    });

    $(".btnFullscreen").on("click", () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });

    $(".theme-image").on("click", function () {
      $(".theme-image").removeClass("active");
      $(this).addClass("active");
    });
  });
</script>

<!-- Header -->
<header class="navbar-header">
  <div class="page-container topbar-menu">
    <div class="flex items-center gap-2">
      <!-- Logo -->
      <a href="/admin" class="logo">
        <!-- Logo Normal -->
        <span class="logo-light">
          <span class="logo-lg"
            ><img src="/assets/img/logo.svg" alt="logo" /></span
          >
          <span class="logo-sm"
            ><img src="/assets/img/logo-small.svg" alt="small logo" /></span
          >
        </span>

        <!-- Logo Dark -->
        <span class="logo-dark">
          <span class="logo-lg"
            ><img src="/assets/img/logo-white.svg" alt="dark logo" /></span
          >
        </span>
      </a>

      <!-- Sidebar Mobile Button -->
      <a id="mobile_btn" class="mobile-btn" href="#sidebar">
        <i class="ti ti-menu-deep fs-24"></i>
      </a>

      <button class="sidenav-toggle-btn btn border-0 p-0" id="toggle_btn2">
        <i class="ti ti-arrow-bar-to-right"></i>
      </button>

      <!-- Search -->
      <div class="me-auto flex items-center header-search d-lg-flex d-none">
        <!-- Search -->
        <div class="input-icon relative me-2">
          <input
            type="text"
            class="form-control"
            placeholder="Search Keyword"
          />
          <span class="input-icon-addon d-inline-flex p-0 header-search-icon"
            ><i class="ti ti-command"></i></span
          >
        </div>
        <!-- /Search -->
      </div>
    </div>

    <div class="flex items-center">
      <!-- Search for Mobile -->
      <div class="header-item flex d-lg-none me-2">
        <button
          class="topbar-link btn"
          data-bs-toggle="modal"
          data-bs-target="#searchModal"
          type="button"
        >
          <i class="ti ti-search fs-16"></i>
        </button>
      </div>

      <!-- Minimize -->
      <div class="header-item">
        <div class="dropdown me-2">
          <a href="#btnFullscreen" class="btn topbar-link btnFullscreen"
            ><i class="ti ti-maximize"></i></a
          >
        </div>
      </div>
      <!-- Minimize -->

      <!-- Light/Dark Mode Button -->
      <div class="header-item d-none d-sm-flex me-2">
        <button
          class="topbar-link btn topbar-link"
          id="light-dark-mode"
          type="button"
        >
          <i class="ti ti-moon fs-16"></i>
        </button>
      </div>

      <!-- User Dropdown -->
      <div class="dropdown profile-dropdown flex items-center justify-center">
        <a
          href="#profile-dropdown"
          class="topbar-link dropdown-toggle drop-arrow-none relative"
          data-bs-toggle="dropdown"
          data-bs-offset="0,22"
          aria-haspopup="false"
          aria-expanded="false"
        >
          <img
            src="/assets/img/users/user-40.jpg"
            width="38"
            class="rounded-1 flex"
            alt="userImage"
          />
          <span class="online text-success"
            ><i
              class="ti ti-circle-filled flex bg-white rounded-circle border border-1 border-white"
            ></i></span
          >
        </a>
        <div
          class="dropdown-menu dropdown-menu-end dropdown-menu-md p-2 top-[70px] right-0"
        >
          <div class="flex items-center bg-light rounded-3 p-2 mb-2">
            <img
              src="/assets/img/users/user-40.jpg"
              class="rounded-circle"
              width="42"
              height="42"
              alt="Img"
            />
            <div class="ms-2">
              <p class="fw-medium text-dark mb-0">{currentUser?.name}</p>
              <span class="d-block fs-13">{currentUser?.role}</span>
            </div>
          </div>

          <!-- Item-->
          <a href="/admin/profile" class="dropdown-item">
            <i class="ti ti-user-circle me-1 align-middle"></i>
            <span class="align-middle">Profile</span>
          </a>

          <!-- Item-->
          <div class="pt-2 mt-2 border-top">
            <button on:click={() => logout()} class="dropdown-item text-danger">
              <i class="ti ti-logout me-1 fs-17 align-middle"></i>
              <span class="align-middle">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</header>

<svelte:body class:menu-opened={slideNav} />
