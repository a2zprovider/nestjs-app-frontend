<script>
  import { onMount } from "svelte";
  import jQuery from "jquery";
  import { goto } from "$app/navigation";
  import { clearUser } from "../../stores/userStore";
  import { checkAuth, logoutUser } from "$lib/utils/auth";

  let currentUser;
  onMount(() => {
    currentUser = checkAuth();
    if (!currentUser) {
      goto("/login");
    }
    console.log("currentUser : ", currentUser);
  });

  const logout = () => {
    clearUser();
    logoutUser();
    goto("/login");
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

    $(document).on("click", function (e) {
      const dropdown = $(".profile-dropdown");
      const menu = dropdown.find(".dropdown-menu");

      if (dropdown.is(e.target) || dropdown.has(e.target).length > 0) {
        menu.toggleClass("show");
      } else {
        menu.removeClass("show");
      }
    });

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
      <a href="index.html" class="logo">
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
            ><img src="assets/img/logo-white.svg" alt="dark logo" /></span
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
          <a href="" class="btn topbar-link btnFullscreen"
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

      <!-- pages -->
      <div class="header-item d-none d-sm-flex">
        <div class="dropdown me-2">
          <a
            href=""
            class="btn topbar-link topbar-teal-link"
            data-bs-toggle="dropdown"
          >
            <i class="ti ti-layout-grid-add"></i>
          </a>
          <div class="dropdown-menu dropdown-menu-end dropdown-menu-md p-2">
            <!-- Item-->
            <a href="contacts.html" class="dropdown-item">
              <div class="flex items-center justify-content-between">
                <div>
                  <span class="flex mb-1 fw-semibold text-dark">Contacts</span>
                  <span class="fs-13">View All the Contacts</span>
                </div>
                <i class="ti ti-chevron-right-pipe text-dark"></i>
              </div>
            </a>

            <!-- Item-->
            <a href="pipeline.html" class="dropdown-item">
              <div class="flex items-center justify-content-between">
                <div>
                  <span class="flex mb-1 fw-semibold text-dark">Pipeline</span>
                  <span class="fs-13">View All the Pipeline</span>
                </div>
                <i class="ti ti-chevron-right-pipe text-dark"></i>
              </div>
            </a>

            <!-- Item-->
            <a href="activities.html" class="dropdown-item">
              <div class="flex items-center justify-content-between">
                <div>
                  <span class="flex mb-1 fw-semibold text-dark">Activities</span
                  >
                  <span class="fs-13">Activities</span>
                </div>
                <i class="ti ti-chevron-right-pipe text-dark"></i>
              </div>
            </a>

            <!-- Item-->
            <a href="analytics.html" class="dropdown-item">
              <div class="flex items-center justify-content-between">
                <div>
                  <span class="flex mb-1 fw-semibold text-dark">Analytics</span>
                  <span class="fs-13">Analytics</span>
                </div>
                <i class="ti ti-chevron-right-pipe text-dark"></i>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- faq -->
      <div class="header-item d-none d-sm-flex">
        <div class="dropdown me-2">
          <a href="faq.html" class="btn topbar-link topbar-indigo-link"
            ><i class="ti ti-help-hexagon"></i></a
          >
        </div>
      </div>

      <!-- report -->
      <div class="header-item d-none d-sm-flex">
        <div class="dropdown me-2">
          <a
            href="lead-reports.html"
            class="btn topbar-link topbar-warning-link"
            ><i class="ti ti-chart-pie"></i></a
          >
        </div>
      </div>

      <div class="header-line"></div>

      <!-- message -->
      <div class="header-item">
        <div class="dropdown me-2">
          <a href="chat.html" class="btn topbar-link">
            <i class="ti ti-message-circle-exclamation"></i>
            <span class="badge rounded-pill">14</span>
          </a>
        </div>
      </div>

      <!-- User Dropdown -->
      <div class="dropdown profile-dropdown flex items-center justify-center">
        <a
          href="#"
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
          <a href="/profile" class="dropdown-item">
            <i class="ti ti-user-circle me-1 align-middle"></i>
            <span class="align-middle">Profile</span>
          </a>

          <!-- Item-->
          <div class="pt-2 mt-2 border-top">
            <a href="#" on:click={logout} class="dropdown-item text-danger">
              <i class="ti ti-logout me-1 fs-17 align-middle"></i>
              <span class="align-middle">Sign Out</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</header>

<svelte:body class:menu-opened={slideNav} />

<style>
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    transition: opacity 0.3s ease;
    opacity: 0;
    visibility: hidden;
  }

  .sidebar-overlay.opened {
    opacity: 1;
    visibility: visible;
  }

  .slide-nav {
    transform: translateX(0);
  }

  html.menu-opened {
    overflow: hidden;
  }
</style>
