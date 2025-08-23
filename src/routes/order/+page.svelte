<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Header from "$lib/components/Header.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import jQuery from "jquery";
  import { authApiFetch } from "$lib/api/client";
  import { errorHandle } from "$lib/utils/errorHandle";

  let orders = [];
  let searchTerm = "";

  // Form state
  let title = "";
  let description = "";
  let loading = false;
  let errorMessage = "";

  // Field-specific error messages
  let formErrors = {};

  async function handleSubmit(event) {
    event.preventDefault();
    errorMessage = "";
    loading = true;
    formErrors = {}; // Reset previous errors

    const newOrder = { title, description };

    try {
      const data = await authApiFetch("orders", {
        method: "POST",
        body: JSON.stringify(newOrder),
      });
      console.log("data  : ", data);
      alert("Form Submitted.");
    } catch (error) {
      loading = false;
      const validationErrors = errorHandle(error);
      console.log("validationErrors : ", validationErrors);

      if (validationErrors && typeof validationErrors === "object") {
        formErrors = validationErrors;
      } else {
        errorMessage = "An unexpected error occurred.";
      }
    } finally {
      console.log("formErrors : ", formErrors);

      loading = false;
    }
  }

  onMount(() => {
    const $ = jQuery;
    const overlay = $('<div class="offcanvas-backdrop fade"></div>');

    // Open offcanvas
    $(document).on("click", "a[data-bs-target='#offcanvas_add']", function () {
      overlay.insertBefore(".main-wrapper");
      $("#offcanvas_add").addClass("show");
      $(".offcanvas-backdrop").addClass("fade show");
      $("body").css({ overflow: "hidden", paddingRight: "15px" });
    });

    // Close offcanvas on clicking backdrop
    $(document).on("click", ".offcanvas-backdrop", function () {
      closeOffcanvas();
    });

    // Close offcanvas on clicking any element with data-bs-dismiss="offcanvas"
    $(document).on("click", '[data-bs-dismiss="offcanvas"]', function () {
      closeOffcanvas();
    });

    function closeOffcanvas() {
      $("#offcanvas_add").removeClass("show");
      $(".offcanvas-backdrop").remove();
      $("body").css({ overflow: "", paddingRight: "" });
    }

    // Editor
    // if ($(".editor").length > 0) {
    //   document.querySelectorAll(".editor").forEach((editor) => {
    //     new Quill(editor, {
    //       theme: "snow",
    //     });
    //   });
    // }

    // Multiple Image
    // if ($(".multiple-img").length > 0) {
    //   function formatState(state) {
    //     if (!state.id) return state.text;
    //     const imageUrl = $(state.element).data("image");
    //     const state1 = $(`
    // 		<span>
    // 			<img src="${imageUrl}" class="img-flag me-1" width="16" alt="flag">
    // 			${state.text}
    // 		</span>
    // 	`);
    //     return state1;
    //   }
    //   $(".multiple-img").select2({
    //     minimumResultsForSearch: Infinity,
    //     templateResult: formatState,
    //     templateSelection: formatState,
    //   });
    // }

    // Filter
    document.addEventListener("DOMContentLoaded", () => {
      const closeBtn = document.getElementById("close-filter");
      const filterDropdown = document.getElementById("filter-dropdown");
      if (closeBtn && filterDropdown) {
        closeBtn.addEventListener("click", () => {
          filterDropdown.classList.remove("show");
        });
      }
    });
  });

  async function fetchOrders() {
    try {
      const query = new URLSearchParams({
        search: searchTerm || "",
      });

      const data = await authApiFetch(`orders?${query.toString()}`, {
        method: "GET",
      });

      orders = data;
      console.log("orders : ", data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  onMount(fetchOrders);

  let debounceTimeout;
  function handleSearchChange(value) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      searchTerm = value;
    }, 300);
  }

  $: [searchTerm], fetchOrders();
</script>

<Header />
<Sidebar />

<div class="page-wrapper">
  <!-- Start Content -->
  <div class="content">
    <!-- Page Header -->
    <div class="flex items-center justify-between gap-2 mb-4 flex-wrap">
      <div>
        <h4 class="mb-1">
          Orders<span class="badge badge-soft-primary ms-2">125</span>
        </h4>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 p-0">
            <li class="breadcrumb-item"><a href="/">Home</a></li>
            <li class="breadcrumb-item active" aria-current="page">Orders</li>
          </ol>
        </nav>
      </div>
      <div class="gap-2 flex items-center flex-wrap">
        <div class="dropdown">
          <a
            href="javascript:void(0);"
            class="dropdown-toggle btn btn-outline-light px-2 shadow"
            data-bs-toggle="dropdown"
          >
            <i class="ti ti-package-export me-2"></i>Export
          </a>
          <div class="dropdown-menu dropdown-menu-end">
            <ul>
              <li>
                <a href="javascript:void(0);" class="dropdown-item">
                  <i class="ti ti-file-type-pdf me-1"></i>Export as PDF
                </a>
              </li>
              <li>
                <a href="javascript:void(0);" class="dropdown-item">
                  <i class="ti ti-file-type-xls me-1"></i>Export as Excel
                </a>
              </li>
            </ul>
          </div>
        </div>
        <a
          href="javascript:void(0);"
          class="btn btn-icon btn-outline-light shadow"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          aria-label="Refresh"
          data-bs-original-title="Refresh"
        >
          <i class="ti ti-refresh"></i>
        </a>
        <a
          href="javascript:void(0);"
          class="btn btn-icon btn-outline-light shadow"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          aria-label="Collapse"
          data-bs-original-title="Collapse"
          id="collapse-header"
        >
          <i class="ti ti-transition-top"></i>
        </a>
      </div>
    </div>
    <!-- End Page Header -->

    <!-- table header -->
    <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
      <div class="flex items-center gap-2 flex-wrap">
        <div class="input-icon input-icon-start position-relative">
          <span class="input-icon-addon text-dark">
            <i class="ti ti-search"></i>
          </span>
          <input
            type="text"
            value={searchTerm}
            on:input={(e) => handleSearchChange(e.target.value)}
            class="form-control"
            placeholder="Search.."
          />
        </div>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <a
          href="javascript:void(0);"
          class="btn btn-primary"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvas_add"
        >
          <i class="ti ti-square-rounded-plus-filled me-1"></i>Add Order
        </a>
      </div>
    </div>
    <!-- table header -->

    <!-- Orders Kanban -->
    <div class="flex overflow-x-auto items-start mb-0 gap-3">
      <div class="kanban-list-items p-2 rounded border">
        <div class="card mb-0 border-0 shadow">
          <div class="card-body p-2">
            <div class="flex justify-between items-center">
              <div>
                <h6 class="flex items-center mb-1">
                  <i class="ti ti-circle-filled fs-10 text-info me-1"></i>
                  Qualify To Buy
                </h6>
                <span>{orders?.length} Orders - $15,44,540</span>
              </div>
              <div class="flex items-center">
                <div class="dropdown table-action ms-2">
                  <a
                    href="#"
                    class="action-icon btn btn-xs shadow btn-icon btn-outline-light"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i class="ti ti-dots-vertical"></i>
                  </a>
                  <div class="dropdown-menu dropdown-menu-right">
                    <a
                      class="dropdown-item"
                      href="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                      ><i class="fa-solid fa-pencil text-blue"></i> Edit</a
                    >
                    <a
                      class="dropdown-item"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_deal"
                      ><i class="fa-regular fa-trash-can text-danger"></i>
                      Delete</a
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="kanban-drag-wrap">
          {#each orders as order}
            <div>
              <div class="card kanban-card border mb-0 mt-3 shadow">
                <div class="card-body">
                  <div class="d-block">
                    <div class="flex items-center mb-3">
                      <a
                        href={`/order/${order?.id}`}
                        class="avatar bg-soft-success text-success rounded-circle flex-shrink-0 me-2"
                      >
                        <span class="avatar-title text-success">HT</span>
                      </a>
                      <h6 class="fw-medium fs-14 mb-0">
                        <a href={`/order/${order?.id}`} class="capitalize"
                          >{order?.title}</a
                        >
                      </h6>
                    </div>
                  </div>
                  <div class="flex flex-column">
                    <p class="text-default d-inline-flex items-center mb-2">
                      <i class="ti ti-report-money text-dark me-1"></i>
                      $03,50,000
                    </p>
                    <p class="text-default d-inline-flex items-center mb-2">
                      <i class="ti ti-mail text-dark me-1"></i>
                      <a href={`mailto:${order?.email}`}>{order?.email}</a>
                    </p>
                    <p class="text-default d-inline-flex items-center mb-2">
                      <i class="ti ti-phone text-dark me-1"></i>
                      {order?.mobile}
                    </p>
                    <p class="text-default d-inline-flex items-center">
                      <i class="ti ti-map-pin-pin text-dark me-1"></i>
                      {order?.address}
                    </p>
                  </div>
                  <div class="flex justify-between items-center">
                    <div class="flex items-center">
                      <a
                        href="javascript:void(0);"
                        class="avatar avatar-xs flex-shrink-0 me-2"
                      >
                        <img
                          src="/assets/img/profiles/avatar-19.jpg"
                          alt="Img"
                          class="rounded-circle"
                        />
                      </a>
                      <a href="javascript:void(0);" class="text-default">
                        {order?.user?.name}
                      </a>
                    </div>
                    <span class="badge bg-success">85%</span>
                  </div>
                  <div
                    class="flex items-center justify-between border-top pt-3 mt-3"
                  >
                    <span>
                      <i class="ti ti-calendar-due"></i>
                      {order?.createdAt &&
                        new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                    </span>
                    <div class="icons-social flex items-center gap-1">
                      <a href="#" class="flex items-center justify-center me-1">
                        <i class="ti ti-phone-check"></i>
                      </a>
                      <a href="#" class="flex items-center justify-center me-1">
                        <i class="ti ti-message-circle-2"></i>
                      </a>
                      <a href="#" class="flex items-center justify-center">
                        <i class="ti ti-color-swatch"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
    <!-- /Orders Kanban -->
  </div>
  <!-- End Content -->
</div>

<!-- Add Canvas -->
<div
  class="offcanvas offcanvas-end offcanvas-large"
  tabindex="-1"
  id="offcanvas_add"
>
  <div class="offcanvas-header border-bottom">
    <h5 class="mb-0">Add New Order</h5>
    <button
      type="button"
      class="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
      data-bs-dismiss="offcanvas"
      aria-label="Close"
    >
    </button>
  </div>
  <div class="offcanvas-body">
    <form on:submit={handleSubmit} class="needs-validation" novalidate>
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">
          <label class="form-label" for="title">
            Title <span class="text-danger">*</span>
          </label>
          <input
            type="text"
            name="title"
            class="form-control"
            class:is-invalid={formErrors.title}
            bind:value={title}
            required
            id="title"
            placeholder="Title"
          />
          {#if formErrors.title}
            <ul class="text-danger mt-1 text-xs capitalize">
              <li>{formErrors.title[0]}</li>
            </ul>
          {/if}
        </div>
        <!-- <div>
          <div class="d-flex align-items-center justify-content-between">
            <label class="form-label" for="Pipeine">
              Pipeine <span class="text-danger">*</span>
            </label>
          </div>
          <select class="select form-control">
            <option>Choose</option>
            <option>Sales</option>
            <option>Marketing</option>
            <option>Calls</option>
          </select>
        </div>
        <div>
          <label class="form-label" for="">
            Status <span class="text-danger">*</span>
          </label>
          <select class="select form-control">
            <option>Choose</option>
            <option>Open</option>
            <option>Lost</option>
            <option>Won</option>
          </select>
        </div>
        <div>
          <label class="form-label" for="">
            Deal Value<span class="text-danger"> *</span>
          </label>
          <input class="form-control" type="text" />
        </div>
        <div>
          <label class="form-label" for="">
            Currency <span class="text-danger">*</span>
          </label>
          <select class="select form-control">
            <option>Choose</option>
            <option>Dollar</option>
            <option>Euro</option>
            <option>Pound</option>
            <option>Rupee</option>
          </select>
        </div>
        <div>
          <label class="form-label" for="">
            Period <span class="text-danger">*</span>
          </label>
          <select class="select form-control">
            <option>Choose</option>
            <option>Days</option>
            <option>Month</option>
          </select>
        </div>
        <div>
          <label class="form-label" for="">
            Period Value <span class="text-danger">*</span>
          </label>
          <input class="form-control" type="text" />
        </div>
        <div>
          <label class="form-label" for="">
            Contact <span class="text-danger">*</span>
          </label>
          <select class="multiple-img form-control" multiple="multiple">
            <option data-image="/assets/img/profiles/avatar-19.jpg" selected
              >Darlee Robertson
            </option>
            <option data-image="/assets/img/profiles/avatar-20.jpg"
              >Sharon Roy</option
            >
            <option data-image="/assets/img/profiles/avatar-21.jpg"
              >Vaughan Lewis</option
            >
            <option data-image="/assets/img/profiles/avatar-23.jpg"
              >Jessica Louise</option
            >
            <option data-image="/assets/img/profiles/avatar-16.jpg"
              >Carol Thomas</option
            >
          </select>
        </div>
        <div>
          <label class="form-label" for="">
            Project <span class="text-danger">*</span>
          </label>
          <input
            class="input-tags form-control border-0 h-100"
            data-choices
            data-choices-limit="infinite"
            data-choices-removeItem
            type="text"
            value="Devops Design, MargrateDesign, UI for Chat"
          />
        </div>
        <div>
          <label class="form-label" for="">
            Due Date <span class="text-danger">*</span>
          </label>
          <div class="input-group w-auto input-group-flat">
            <input
              type="text"
              class="form-control"
              data-provider="flatpickr"
              data-date-format="d M, Y"
            />
            <span class="input-group-text">
              <i class="ti ti-calendar"></i>
            </span>
          </div>
        </div>
        <div>
          <label class="form-label" for="">
            Expected Closing Date <span class="text-danger">*</span>
          </label>
          <div class="input-group w-auto input-group-flat">
            <input
              type="text"
              class="form-control"
              data-provider="flatpickr"
              data-date-format="d M, Y"
            />
            <span class="input-group-text">
              <i class="ti ti-calendar"></i>
            </span>
          </div>
        </div>
        <div>
          <label class="form-label" for="">
            Assignee <span class="text-danger">*</span>
          </label>
          <select class="multiple-img form-control" multiple="multiple">
            <option data-image="/assets/img/profiles/avatar-19.jpg"
              >Darlee Robertson</option
            >
            <option data-image="/assets/img/profiles/avatar-20.jpg" selected
              >Sharon Roy</option
            >
            <option data-image="/assets/img/profiles/avatar-21.jpg"
              >Vaughan Lewis</option
            >
            <option data-image="/assets/img/profiles/avatar-23.jpg"
              >Jessica Louise</option
            >
            <option data-image="/assets/img/profiles/avatar-16.jpg"
              >Carol Thomas</option
            >
          </select>
        </div>
        <div>
          <label class="form-label" for="">
            Follow Up Date <span class="text-danger">*</span>
          </label>
          <div class="input-group w-auto input-group-flat">
            <input
              type="text"
              class="form-control"
              data-provider="flatpickr"
              data-date-format="d M, Y"
            />
            <span class="input-group-text">
              <i class="ti ti-calendar"></i>
            </span>
          </div>
        </div>
        <div>
          <label class="form-label" for="">
            Source <span class="text-danger">*</span>
          </label>
          <select class="select form-control">
            <option>Select</option>
            <option>Google</option>
            <option>Social Media</option>
          </select>
        </div>
        <div>
          <label class="form-label" for="">
            Tags <span class="text-danger">*</span>
          </label>
          <input
            class="input-tags form-control border-0 h-100"
            data-choices
            data-choices-limit="infinite"
            data-choices-removeItem
            type="text"
            value="Collab, Rated"
          />
        </div>
        <div>
          <label class="form-label" for="">
            Priority <span class="text-danger">*</span>
          </label>
          <select class="select form-control">
            <option>Select</option>
            <option>High</option>
            <option>Low</option>
            <option>Medium</option>
          </select>
        </div> -->
        <div class="col-span-2">
          <label class="form-label" for="description"> Description </label>
          <textarea
            name="description"
            id="description"
            class="form-control"
            class:is-invalid={formErrors.description}
            bind:value={description}
            required
            placeholder="Description"
          ></textarea>

          {#if formErrors.description}
            <ul class="text-danger mt-1 text-xs capitalize">
              <li>{formErrors.description[0]}</li>
            </ul>
          {/if}
        </div>
      </div>
      <div class="d-flex align-items-center justify-content-end mt-4">
        <button
          type="button"
          data-bs-dismiss="offcanvas"
          class="btn btn-light me-2">Cancel</button
        >

        <button class="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create New"}
        </button>
      </div>
    </form>
  </div>
</div>
<!-- /Add Canvas -->
