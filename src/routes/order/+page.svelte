<script>
  import { onMount } from "svelte";
  import Header from "$lib/components/Header.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import jQuery from "jquery";
  import { authApiFetch } from "$lib/api/client";
  import { errorHandle } from "$lib/utils/errorHandle";
  import { API_ROUTES } from "$lib/constants/apiRoutes";
  import Swal from "sweetalert2";

  let orders = [];
  let searchTerm = "";

  // Form state
  let title = "";
  let category = "";
  let orderDate = null;
  let startDate = null;
  let deadlineDate = null;
  let price = null;
  let priceTerms = null;
  let source = null;
  let description = "";

  let name = "";
  let email = "";
  let mobile = "";
  let whatsapp = "";
  let city = "";
  let state = "";
  let country = "";
  let address = "";
  let gstNumber = "";

  let loading = false;
  let errorMessage = "";

  // Field-specific error messages
  let formErrors = {};

  function closeOffcanvas() {
    const $ = jQuery;
    $("#offcanvas_add").removeClass("show");
    $(".offcanvas-backdrop").remove();
    $("body").css({ overflow: "", paddingRight: "" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    errorMessage = "";
    loading = true;
    formErrors = {}; // Reset previous errors

    const newOrder = {
      title,
      category,
      price,
      priceTerms,
      source,
      description,
    };
    if (orderDate) {
      newOrder.orderDate = orderDate;
    }
    if (startDate) {
      newOrder.startDate = startDate;
    }
    if (deadlineDate) {
      newOrder.deadlineDate = deadlineDate;
    }

    const newClient = {
      name,
      mobile,
      whatsapp,
      city,
      state,
      country,
      address,
      gstNumber,
    };
    email ? (newClient.email = email) : "";
    newOrder.orderClient = newClient;
    if (title == "") {
      formErrors.title = ["Title is required."];
      loading = false;
      return;
    }
    if (name == "") {
      formErrors.name = ["Name is required."];
      loading = false;
      return;
    }

    try {
      const data = await authApiFetch(API_ROUTES.ORDER, {
        method: "POST",
        data: JSON.stringify(newOrder),
      });
      console.log("data  : ", data);

      orders = [data.data, ...orders];
      Swal.fire("Success!", data.message, "success");
      closeOffcanvas();
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

    // Open offcanvas
    $(document).on("click", "a[data-bs-target='#offcanvas_add']", function () {
      // Remove any existing backdrop before adding a new one
      $(".offcanvas-backdrop").remove();

      // Create and insert a new backdrop
      const overlay = $('<div class="offcanvas-backdrop fade show"></div>');
      overlay.insertBefore(".main-wrapper");

      $("#offcanvas_add").addClass("show");
      $("body").css({ overflow: "hidden", paddingRight: "15px" });
    });

    $(document).on("click", ".offcanvas-backdrop", closeOffcanvas);
    $(document).on("click", '[data-bs-dismiss="offcanvas"]', closeOffcanvas);

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

      const data = await authApiFetch(
        `${API_ROUTES.ORDER}?${query.toString()}`,
        {
          method: "GET",
        }
      );

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

  function getAvatarText(title) {
    if (!title) return "";
    const words = title.trim().split(" ");
    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  }
</script>

<Header />
<Sidebar />

<div class="page-wrapper">
  <!-- Start Content -->
  <div class="content">
    <!-- Page Header -->
    <div class="flex items-center justify-between gap-2 mb-4 flex-wrap">
      <div>
        <h4 class="mb-1">Orders</h4>
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
            href="#Export"
            class="dropdown-toggle btn btn-outline-light px-2 shadow"
            data-bs-toggle="dropdown"
          >
            <i class="ti ti-package-export me-2"></i>Export
          </a>
          <div class="dropdown-menu dropdown-menu-end">
            <ul>
              <li>
                <a href="#pdf" class="dropdown-item">
                  <i class="ti ti-file-type-pdf me-1"></i>Export as PDF
                </a>
              </li>
              <li>
                <a href="#Excel" class="dropdown-item">
                  <i class="ti ti-file-type-xls me-1"></i>Export as Excel
                </a>
              </li>
            </ul>
          </div>
        </div>
        <a
          href="#Refresh"
          class="btn btn-icon btn-outline-light shadow"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          aria-label="Refresh"
          data-bs-original-title="Refresh"
        >
          <i class="ti ti-refresh"></i>
        </a>
        <a
          href="#Collapse"
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
          href="#offcanvas_add"
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
      <!-- New Lead -->
      <div class="kanban-list-items p-2 rounded border">
        <div class="card mb-0 border-0 shadow">
          <div class="card-body p-2">
            <div class="flex justify-between items-center">
              <div>
                <h6 class="flex items-center mb-1">
                  <i class="ti ti-circle-filled fs-10 text-info me-1"></i>
                  New Lead
                </h6>
                <span>{orders?.length} Orders - ₹ 1,00,000.00</span>
              </div>
            </div>
          </div>
        </div>
        {#if orders.length}
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
                          <span class="avatar-title text-success"
                            >{getAvatarText(order?.title)}</span
                          >
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
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })
                          .format(order?.price || 0)
                          .replace("₹", "₹ ")}
                      </p>
                      <p class="text-default d-inline-flex items-center mb-2">
                        <i class="ti ti-mail text-dark me-1"></i>
                        <a href={`mailto:${order?.orderClient?.email}`}
                          >{order?.orderClient?.email ?? "-"}</a
                        >
                      </p>
                      <p class="text-default d-inline-flex items-center mb-2">
                        <i class="ti ti-phone text-dark me-1"></i>
                        {order?.orderClient?.mobile ?? "-"}
                      </p>
                      <p class="text-default d-inline-flex items-center">
                        <i class="ti ti-map-pin-pin text-dark me-1"></i>
                        {order?.orderClient?.address ?? "-"}
                      </p>
                    </div>
                    <div class="flex justify-between items-center">
                      <div class="flex items-center">
                        <a
                          href="#user"
                          class="avatar avatar-xs flex-shrink-0 me-2"
                        >
                          <img
                            src="/assets/img/profiles/avatar-19.jpg"
                            alt="Img"
                            class="rounded-circle"
                          />
                        </a>
                        <a href="#user" class="text-default">
                          {order?.orderClient?.name}
                        </a>
                      </div>
                      <span class="badge bg-success">{order?.status}</span>
                    </div>
                    <div
                      class="flex items-center justify-between border-top pt-3 mt-3"
                    >
                      <span>
                        <i class="ti ti-calendar-due"></i>
                        {order?.orderDate &&
                          new Date(order.orderDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                      </span>
                      <div class="icons-social flex items-center gap-1">
                        <a
                          href="#phone"
                          class="flex items-center justify-center me-1"
                        >
                          <i class="ti ti-phone-check"></i>
                        </a>
                        <a
                          href="#message"
                          class="flex items-center justify-center me-1"
                        >
                          <i class="ti ti-message-circle-2"></i>
                        </a>
                        <a
                          href="#label"
                          class="flex items-center justify-center"
                        >
                          <i class="ti ti-color-swatch"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
      <!-- Contacted -->
      <div class="kanban-list-items p-2 rounded border">
        <div class="card mb-0 border-0 shadow">
          <div class="card-body p-2">
            <div class="flex justify-between items-center">
              <div>
                <h6 class="flex items-center mb-1">
                  <i class="ti ti-circle-filled fs-10 text-info me-1"></i>
                  Contacted
                </h6>
                <span>0 Orders - ₹ 0.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Follow-Up -->
      <div class="kanban-list-items p-2 rounded border">
        <div class="card mb-0 border-0 shadow">
          <div class="card-body p-2">
            <div class="flex justify-between items-center">
              <div>
                <h6 class="flex items-center mb-1">
                  <i class="ti ti-circle-filled fs-10 text-info me-1"></i>
                  Follow-Up
                </h6>
                <span>0 Orders - ₹ 0.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Qualified -->
      <div class="kanban-list-items p-2 rounded border">
        <div class="card mb-0 border-0 shadow">
          <div class="card-body p-2">
            <div class="flex justify-between items-center">
              <div>
                <h6 class="flex items-center mb-1">
                  <i class="ti ti-circle-filled fs-10 text-info me-1"></i>
                  Qualified
                </h6>
                <span>0 Orders - ₹ 0.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Unqualified -->
      <div class="kanban-list-items p-2 rounded border">
        <div class="card mb-0 border-0 shadow">
          <div class="card-body p-2">
            <div class="flex justify-between items-center">
              <div>
                <h6 class="flex items-center mb-1">
                  <i class="ti ti-circle-filled fs-10 text-info me-1"></i>
                  Unqualified
                </h6>
                <span>0 Orders - ₹ 0.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Needs Assessment -->
      <div class="kanban-list-items p-2 rounded border">
        <div class="card mb-0 border-0 shadow">
          <div class="card-body p-2">
            <div class="flex justify-between items-center">
              <div>
                <h6 class="flex items-center mb-1">
                  <i class="ti ti-circle-filled fs-10 text-info me-1"></i>
                  Needs Assessment
                </h6>
                <span>0 Orders - ₹ 0.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Quotation Sent -->
      <div class="kanban-list-items p-2 rounded border">
        <div class="card mb-0 border-0 shadow">
          <div class="card-body p-2">
            <div class="flex justify-between items-center">
              <div>
                <h6 class="flex items-center mb-1">
                  <i class="ti ti-circle-filled fs-10 text-info me-1"></i>
                  Quotation Sent
                </h6>
                <span>0 Orders - ₹ 0.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Negotiation in Progress -->
      <div class="kanban-list-items p-2 rounded border">
        <div class="card mb-0 border-0 shadow">
          <div class="card-body p-2">
            <div class="flex justify-between items-center">
              <div>
                <h6 class="flex items-center mb-1">
                  <i class="ti ti-circle-filled fs-10 text-info me-1"></i>
                  Negotiation in Progress
                </h6>
                <span>0 Orders - ₹ 0.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Deal Won -->
      <div class="kanban-list-items p-2 rounded border">
        <div class="card mb-0 border-0 shadow">
          <div class="card-body p-2">
            <div class="flex justify-between items-center">
              <div>
                <h6 class="flex items-center mb-1">
                  <i class="ti ti-circle-filled fs-10 text-info me-1"></i>
                  Deal Won
                </h6>
                <span>0 Orders - ₹ 0.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Deal Lost -->
      <div class="kanban-list-items p-2 rounded border">
        <div class="card mb-0 border-0 shadow">
          <div class="card-body p-2">
            <div class="flex justify-between items-center">
              <div>
                <h6 class="flex items-center mb-1">
                  <i class="ti ti-circle-filled fs-10 text-info me-1"></i>
                  Deal Lost
                </h6>
                <span>0 Orders - ₹ 0.00</span>
              </div>
            </div>
          </div>
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
    <form
      on:submit={handleSubmit}
      class="needs-validation space-y-4"
      novalidate
    >
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
        <div>
          <label class="form-label" for="category">Category</label>
          <input
            type="text"
            name="category"
            class="form-control"
            class:is-invalid={formErrors.category}
            bind:value={category}
            id="category"
            placeholder="Category"
          />
          {#if formErrors.category}
            <ul class="text-danger mt-1 text-xs capitalize">
              <li>{formErrors.category[0]}</li>
            </ul>
          {/if}
        </div>
        <div>
          <label class="form-label" for="orderDate">Order Date</label>
          <input
            type="date"
            name="orderDate"
            class="form-control"
            class:is-invalid={formErrors.orderDate}
            bind:value={orderDate}
            id="orderDate"
            placeholder="Order Date"
          />
          {#if formErrors.orderDate}
            <ul class="text-danger mt-1 text-xs capitalize">
              <li>{formErrors.orderDate[0]}</li>
            </ul>
          {/if}
        </div>
        <div>
          <label class="form-label" for="startDate">Start Date</label>
          <input
            type="date"
            name="startDate"
            class="form-control"
            class:is-invalid={formErrors.startDate}
            bind:value={startDate}
            id="startDate"
            placeholder="Start Date"
          />
          {#if formErrors.startDate}
            <ul class="text-danger mt-1 text-xs capitalize">
              <li>{formErrors.startDate[0]}</li>
            </ul>
          {/if}
        </div>
        <div>
          <label class="form-label" for="deadlineDate">Deadline Date</label>
          <input
            type="date"
            name="deadlineDate"
            class="form-control"
            class:is-invalid={formErrors.deadlineDate}
            bind:value={deadlineDate}
            id="deadlineDate"
            placeholder="Deadline Date"
          />
          {#if formErrors.deadlineDate}
            <ul class="text-danger mt-1 text-xs capitalize">
              <li>{formErrors.deadlineDate[0]}</li>
            </ul>
          {/if}
        </div>
        <div>
          <label class="form-label" for="price">Price</label>
          <input
            type="number"
            name="price"
            class="form-control"
            class:is-invalid={formErrors.price}
            bind:value={price}
            id="price"
            placeholder="Price"
          />
          {#if formErrors.price}
            <ul class="text-danger mt-1 text-xs capitalize">
              <li>{formErrors.price[0]}</li>
            </ul>
          {/if}
        </div>
        <div>
          <label class="form-label" for="priceTerms">Price Terms</label>
          <input
            type="text"
            name="priceTerms"
            class="form-control"
            class:is-invalid={formErrors.priceTerms}
            bind:value={priceTerms}
            id="priceTerms"
            placeholder="Price Terms"
          />
          {#if formErrors.priceTerms}
            <ul class="text-danger mt-1 text-xs capitalize">
              <li>{formErrors.priceTerms[0]}</li>
            </ul>
          {/if}
        </div>
        <div>
          <label class="form-label" for="source">Source</label>
          <input
            type="text"
            name="source"
            class="form-control"
            class:is-invalid={formErrors.source}
            bind:value={source}
            id="source"
            placeholder="Source"
          />
          {#if formErrors.source}
            <ul class="text-danger mt-1 text-xs capitalize">
              <li>{formErrors.source[0]}</li>
            </ul>
          {/if}
        </div>
      </div>
      <hr />
      <h6>Client Details</h6>
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">
          <label class="form-label" for="name">
            Name <span class="text-danger">*</span>
          </label>
          <input
            type="text"
            name="name"
            class="form-control"
            class:is-invalid={formErrors.name}
            bind:value={name}
            required
            id="name"
            placeholder="Name"
          />
          {#if formErrors.name}
            <ul class="text-danger mt-1 text-xs capitalize">
              <li>{formErrors.name[0]}</li>
            </ul>
          {/if}
        </div>
        <div>
          <label class="form-label" for="email"> Email </label>
          <input
            type="email"
            name="email"
            class="form-control"
            class:is-invalid={formErrors.email}
            bind:value={email}
            id="email"
            placeholder="Email"
          />
          {#if formErrors.email}
            <ul class="text-danger mt-1 text-xs capitalize">
              <li>{formErrors.email[0]}</li>
            </ul>
          {/if}
        </div>
        <div>
          <label class="form-label" for="mobile"> Mobile </label>
          <input
            type="text"
            name="mobile"
            class="form-control"
            class:is-invalid={formErrors.mobile}
            bind:value={mobile}
            id="mobile"
            placeholder="Mobile"
          />
          {#if formErrors.mobile}
            <ul class="text-danger mt-1 text-xs capitalize">
              <li>{formErrors.mobile[0]}</li>
            </ul>
          {/if}
        </div>

        <div>
          <label class="form-label" for="whatsapp"> Whatsapp </label>
          <input
            type="text"
            name="whatsapp"
            class="form-control"
            class:is-invalid={formErrors.whatsapp}
            bind:value={whatsapp}
            id="whatsapp"
            placeholder="Whatsapp"
          />
          {#if formErrors.whatsapp}
            <ul class="text-danger mt-1 text-xs capitalize">
              <li>{formErrors.whatsapp[0]}</li>
            </ul>
          {/if}
        </div>
        <div>
          <label class="form-label" for="city"> City </label>
          <input
            type="text"
            name="city"
            class="form-control"
            class:is-invalid={formErrors.city}
            bind:value={city}
            id="city"
            placeholder="City"
          />
          {#if formErrors.city}
            <ul class="text-danger mt-1 text-xs capitalize">
              <li>{formErrors.city[0]}</li>
            </ul>
          {/if}
        </div>
        <div>
          <label class="form-label" for="state"> State </label>
          <input
            type="text"
            name="state"
            class="form-control"
            class:is-invalid={formErrors.state}
            bind:value={state}
            id="state"
            placeholder="State"
          />
          {#if formErrors.state}
            <ul class="text-danger mt-1 text-xs capitalize">
              <li>{formErrors.state[0]}</li>
            </ul>
          {/if}
        </div>
        <div>
          <label class="form-label" for="country"> Country </label>
          <input
            type="text"
            name="country"
            class="form-control"
            class:is-invalid={formErrors.country}
            bind:value={country}
            id="country"
            placeholder="Country"
          />
          {#if formErrors.country}
            <ul class="text-danger mt-1 text-xs capitalize">
              <li>{formErrors.country[0]}</li>
            </ul>
          {/if}
        </div>
        <div>
          <label class="form-label" for="address"> Address </label>
          <input
            type="text"
            name="address"
            class="form-control"
            class:is-invalid={formErrors.address}
            bind:value={address}
            id="address"
            placeholder="Address"
          />
          {#if formErrors.address}
            <ul class="text-danger mt-1 text-xs capitalize">
              <li>{formErrors.address[0]}</li>
            </ul>
          {/if}
        </div>
        <div>
          <label class="form-label" for="gstNumber"> GST Number </label>
          <input
            type="text"
            name="gstNumber"
            class="form-control"
            class:is-invalid={formErrors.gstNumber}
            bind:value={gstNumber}
            id="gstNumber"
            placeholder="GST Number"
          />
          {#if formErrors.gstNumber}
            <ul class="text-danger mt-1 text-xs capitalize">
              <li>{formErrors.gstNumber[0]}</li>
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
