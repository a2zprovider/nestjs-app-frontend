<script>
  import { onMount } from "svelte";
  import jQuery from "jquery";
  import { authApiFetch } from "$lib/api/client";
  import { errorHandle } from "$lib/utils/errorHandle";
  import { API_ROUTES } from "$lib/constants/apiRoutes";
  import Swal from "sweetalert2";
  import OrderDragula from "$lib/components/OrderDragula.svelte";
  import { writable } from "svelte/store";

  let orders = writable([]);

  function updateOrderStatus(orderId, newStatus) {
    let n_order = orders.find((order) => order.id == orderId);
    if (n_order) {
      n_order.status = newStatus;
      orders = orders.map((order) => (order.id === orderId ? n_order : order));
    }
    statusUpdate(n_order);
  }
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

  let accordingToStatusOrders = {
    NewLead: [],
    Contacted: [],
    FollowUp: [],
    Qualified: [],
    Unqualified: [],
    NeedsAssessment: [],
    QuotationSent: [],
    NegotiationInProgress: [],
    DealWon: [],
    DealLost: [],
  };

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

      // Filter orders by status dynamically
      const statuses = [
        "New Lead",
        "Contacted",
        "Follow Up",
        "Qualified",
        "Unqualified",
        "Needs Assessment",
        "Quotation Sent",
        "Negotiation In Progress",
        "Deal Won",
        "Deal Lost",
      ];

      // Loop through statuses and filter orders for each status
      statuses.forEach((status) => {
        accordingToStatusOrders[status.replace(/\s+/g, "")] = orders.filter(
          (order) => order.status === status
        );
      });

      console.log("Filtered orders by status:", accordingToStatusOrders);
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

  async function statusUpdate(order) {
    errorMessage = "";
    formErrors = {};

    const updateOrder = {
      title: order.title,
      status: order.status,
    };

    try {
      const data = await authApiFetch(API_ROUTES.ORDER + "/" + order.id, {
        method: "PUT",
        data: JSON.stringify(updateOrder),
      });
      console.log("data  : ", data);
    } catch (error) {
      const validationErrors = errorHandle(error);
      console.log("validationErrors : ", validationErrors);

      if (validationErrors && typeof validationErrors === "object") {
        formErrors = validationErrors;
      } else {
        errorMessage = "An unexpected error occurred.";
      }
    } finally {
      console.log("formErrors : ", formErrors);
    }
  }
</script>

<div class="page-wrapper">
  <!-- Start Content -->
  <div class="content">
    <!-- Page Header -->
    <div class="flex items-center justify-between gap-2 mb-4 flex-wrap">
      <div>
        <h4 class="mb-1">Orders</h4>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 p-0">
            <li class="breadcrumb-item"><a href="/admin/dashboard">Home</a></li>
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
    <OrderDragula {orders} {accordingToStatusOrders} {updateOrderStatus} />
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
