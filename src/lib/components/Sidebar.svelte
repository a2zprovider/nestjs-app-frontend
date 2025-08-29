<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import jQuery from "jquery";
  import { checkAuth } from "$lib/utils/auth";

  let openMenu = null;

  $: currentPath = $page.url.pathname;

  $: if (openMenu !== null) {
    openMenu = null;
  }

  const toggleMenu = (menuName) => {
    openMenu = openMenu === menuName ? null : menuName;
  };

  onMount(() => {
    const $ = jQuery;
    const wrapper = $(".main-wrapper");

    // ✅ Prevent duplicate overlays
    if ($(".sidebar-overlay").length === 0) {
      const overlay = $('<div class="sidebar-overlay"></div>');
      overlay.insertBefore(".main-wrapper");
    }

    const overlay = $(".sidebar-overlay");

    // Event handlers
    const toggleMenuHandler = function (e) {
      e.preventDefault();
      wrapper.toggleClass("slide-nav");
      overlay.toggleClass("opened");
      $("html").toggleClass("menu-opened");
    };

    const closeMenuHandler = function () {
      wrapper.removeClass("slide-nav");
      overlay.removeClass("opened");
      $("html").removeClass("menu-opened");
    };

    const submenuClickHandler = function (e) {
      const link = $(this);
      const submenu = link.next("ul");

      if (link.parent().hasClass("submenu")) {
        e.preventDefault();

        if (!link.hasClass("subdrop")) {
          link.closest("ul").find("ul").slideUp(250);
          link.closest("ul").find("a").removeClass("subdrop");

          submenu.slideDown(350);
          link.addClass("subdrop");
        } else {
          link.removeClass("subdrop");
          submenu.slideUp(350);
        }
      }
    };

    const mouseOverHandler = function (e) {
      if (
        $("body").hasClass("mini-sidebar") &&
        $("#toggle_btn").is(":visible")
      ) {
        const insideSidebar = $(e.target).closest(
          ".sidebar, .header-left"
        ).length;

        if (insideSidebar) {
          $("body").addClass("expand-menu");
          $(".subdrop + ul").slideDown();
        } else {
          $("body").removeClass("expand-menu");
          $(".subdrop + ul").slideUp();
        }
        return false;
      }
    };

    // Bind events
    $(document).on("click", "#mobile_btn", toggleMenuHandler);
    $(document).on(
      "click",
      ".sidebar-close, .sidebar-overlay",
      closeMenuHandler
    );
    $(".sidebar-menu a").on("click", submenuClickHandler);
    $(document).on("mouseover", mouseOverHandler);

    // Activate submenu on load
    $(".sidebar-menu ul li.submenu a.active")
      .parents("li.submenu")
      .children("a")
      .addClass("active subdrop")
      .next("ul")
      .show();

    // Sticky sidebar (optional)
    if ($(window).width() > 767 && $(".theiaStickySidebar").length > 0) {
      $(".theiaStickySidebar").theiaStickySidebar({
        additionalMarginTop: 30,
      });
    }

    // ✅ Clean up on destroy
    return () => {
      $(document).off("click", "#mobile_btn", toggleMenuHandler);
      $(document).off(
        "click",
        ".sidebar-close, .sidebar-overlay",
        closeMenuHandler
      );
      $(".sidebar-menu a").off("click", submenuClickHandler);
      $(document).off("mouseover", mouseOverHandler);
    };
  });

  let currentUser;
  onMount(() => {
    currentUser = checkAuth();
    if (!currentUser) {
      goto("/login");
    }
  });
</script>

<div class="sidebar" id="sidebar">
  <!-- Start Logo -->
  <div class="sidebar-logo flex items-center h-[57px]">
    <div>
      <!-- Logo Normal -->
      <a href="/admin/dashboard" class="logo logo-normal">
        <img src="/assets/img/logo.svg" alt="Logo" />
      </a>

      <!-- Logo Small -->
      <a href="/admin/dashboard" class="logo-small">
        <img src="/assets/img/logo-small.svg" alt="Logo" />
      </a>

      <!-- Logo Dark -->
      <a href="/admin/dashboard" class="dark-logo">
        <img src="/assets/img/logo-white.svg" alt="Logo" />
      </a>
    </div>
    <button class="sidenav-toggle-btn btn border-0 p-0 active" id="toggle_btn">
      <i class="ti ti-arrow-bar-to-left"></i>
    </button>

    <!-- Sidebar Menu Close -->
    <button class="sidebar-close">
      <i class="ti ti-x align-middle"></i>
    </button>
  </div>
  <!-- End Logo -->

  <!-- Sidenav Menu -->
  <div class="sidebar-inner simplebar-scrollable-y" data-simplebar="init">
    <div class="simplebar-wrapper" style="margin: 0px;">
      <div class="simplebar-height-auto-observer-wrapper">
        <div class="simplebar-height-auto-observer"></div>
      </div>
      <div class="simplebar-mask">
        <div class="simplebar-offset" style="right: 0px; bottom: 0px;">
          <div
            class="simplebar-content-wrapper"
            tabIndex="0"
            role="region"
            aria-label="scrollable content"
            style="height: 100%; overflow: hidden scroll;"
          >
            <div class="simplebar-content" style="padding: 0px;">
              <div id="sidebar-menu" class="sidebar-menu">
                <ul>
                  <li class="menu-title"><span>Main Menu</span></li>
                  <li>
                    <ul>
                      <li class="submenu">
                        <a
                          href="#dashboard"
                          on:click={() => toggleMenu("dashboard")}
                          class:active={openMenu === "dashboard"}
                          class:subdrop={openMenu === "dashboard"}
                        >
                          <i class="ti ti-dashboard"></i><span>Dashboard</span>
                          <span class="menu-arrow"></span>
                        </a>
                        <ul>
                          <li>
                            <a
                              href="/admin/dashboard"
                              class:active={currentPath.startsWith(
                                "/admin/dashboard"
                              )}
                            >
                              Dashboard
                            </a>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li class="menu-title"><span>CRM</span></li>
                  <li>
                    <ul>
                      {#if currentUser?.role == "admin"}
                        <li>
                          <a
                            href="/admin/user"
                            class:active={currentPath.startsWith("/admin/user")}
                          >
                            <i class="ti ti-user-up"></i><span>Users</span>
                          </a>
                        </li>
                      {/if}
                      <li>
                        <a
                          href="/admin/order"
                          class:active={currentPath.startsWith("/admin/order")}
                        >
                          <i class="ti ti-medal"></i><span>Orders</span>
                        </a>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="simplebar-placeholder"
        style="width: 239px; height: 3056px;"
      ></div>
    </div>
    <div
      class="simplebar-track simplebar-horizontal"
      style="visibility: hidden;"
    >
      <div class="simplebar-scrollbar" style="width: 0px; display: none;"></div>
    </div>
    <div
      class="simplebar-track simplebar-vertical"
      style="visibility: visible;"
    >
      <div
        class="simplebar-scrollbar"
        style="height: 101px; transform: translate3d(0px, 0px, 0px); display: block;"
      ></div>
    </div>
  </div>
</div>
