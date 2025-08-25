<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Header from "$lib/components/Header.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import jQuery from "jquery";
  import { page } from "$app/stores";
  import { authApiFetch } from "$lib/api/client";
  import { errorHandle } from "$lib/utils/errorHandle";

  let errorMessage = "";
  let order = null;
  let updateMount = true;

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

    const updateOrder = {
      title,
      category,
      price,
      priceTerms,
      source,
      description,
    };
    if (orderDate) {
      updateOrder.orderDate = orderDate;
    }
    if (startDate) {
      updateOrder.startDate = startDate;
    }
    if (deadlineDate) {
      updateOrder.deadlineDate = deadlineDate;
    }

    const updateClient = {
      name,
      mobile,
      whatsapp,
      city,
      state,
      country,
      address,
      gstNumber,
    };
    email ? (updateClient.email = email) : "";
    updateOrder.orderClient = updateClient;
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
      const data = await authApiFetch("orders/" + order.id, {
        method: "PUT",
        body: JSON.stringify(updateOrder),
      });
      console.log("data  : ", data);

      order = data.data;
      // orders = [data.data, ...orders];
      alert(data.message);
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

  let orderId;
  $: orderId = $page.params.id;

  onMount(async () => {
    try {
      const data = await authApiFetch(`orders/${orderId}`);
      order = data;

      // update params
      title = data?.title;
      category = data?.category;
      // orderDate = data?.orderDate;
      // startDate = data?.startDate;
      // deadlineDate = data?.deadlineDate;
      orderDate = data?.orderDate
        ? new Date(data.orderDate).toISOString().substring(0, 10)
        : "";
      startDate = data?.startDate
        ? new Date(data.startDate).toISOString().substring(0, 10)
        : "";
      deadlineDate = data?.deadlineDate
        ? new Date(data.deadlineDate).toISOString().substring(0, 10)
        : "";

      price = data?.price;
      priceTerms = data?.priceTerms;
      source = data?.source;
      description = data?.description;

      name = data?.orderClient?.name;
      email = data?.orderClient?.email;
      mobile = data?.orderClient?.mobile;
      whatsapp = data?.orderClient?.whatsapp;
      city = data?.orderClient?.city;
      state = data?.orderClient?.state;
      country = data?.orderClient?.country;
      address = data?.orderClient?.address;
      gstNumber = data?.orderClient?.gstNumber;
    } catch (err) {
      errorMessage = "Failed to load order data.";
    }
  });

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

  function getAvatarText(title) {
    if (!title) return "";
    const words = title.trim().split(" ");
    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  let activeTab = "Activity";
</script>

<Header />
<Sidebar />

<div class="page-wrapper">
  <!-- Start Content -->
  <div class="content pb-0">
    <!-- Page Header -->
    <div
      class="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap"
    >
      <div>
        <h4 class="mb-1">Order</h4>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 p-0">
            <li class="breadcrumb-item"><a href="/">Home</a></li>
            <li class="breadcrumb-item"><a href="/order">Orders</a></li>
            <li class="breadcrumb-item active" aria-current="page">Order</li>
          </ol>
        </nav>
      </div>
      <div class="gap-2 d-flex align-items-center flex-wrap">
        <div class="dropdown">
          <a
            href="javascript:void(0);"
            class="dropdown-toggle btn btn-outline-light px-2 shadow"
            data-bs-toggle="dropdown"
            ><i class="ti ti-package-export me-2"></i>Export</a
          >
          <div class="dropdown-menu dropdown-menu-end">
            <ul>
              <li>
                <a href="javascript:void(0);" class="dropdown-item"
                  ><i class="ti ti-file-type-pdf me-1"></i>Export as PDF</a
                >
              </li>
              <li>
                <a href="javascript:void(0);" class="dropdown-item"
                  ><i class="ti ti-file-type-xls me-1"></i>Export as Excel
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
          data-bs-original-title="Refresh"><i class="ti ti-refresh"></i></a
        >
        <a
          href="javascript:void(0);"
          class="btn btn-icon btn-outline-light shadow"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          aria-label="Collapse"
          data-bs-original-title="Collapse"
          id="collapse-header"><i class="ti ti-transition-top"></i></a
        >
      </div>
    </div>
    <!-- End Page Header -->

    {#if order}
      <div class="row">
        <div class="col-md-12">
          <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div>
              <a href="/order">
                <i class="ti ti-arrow-narrow-left me-1"></i>Back to Orders
              </a>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <a
                href="javascript:void(0);"
                class="btn btn-primary"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvas_add"
              >
                <i class="ti ti-square-rounded-plus-filled me-1"></i>Edit Order
              </a>
            </div>
          </div>

          <div class="card">
            <div class="card-body pb-2">
              <div
                class="d-flex align-items-center justify-content-between flex-wrap"
              >
                <div class="d-flex align-items-center mb-2">
                  <div
                    class="avatar avatar-xxl avatar-rounded border border-warning bg-soft-warning me-3 flex-shrink-0"
                  >
                    <h6 class="mb-0 text-warning">
                      {getAvatarText(order?.title)}
                    </h6>
                  </div>
                  <div>
                    <h5 class="mb-1 capitalize">
                      {order?.title}
                      <i class="ti ti-star-filled text-warning"></i>
                    </h5>
                    <p class="mb-1">
                      <i class="ti ti-building-skyscraper me-1"
                      ></i>{order?.category}
                    </p>
                    <p class="mb-0">
                      <i class="ti ti-map-pin-pin me-1"></i>{order?.source}
                    </p>
                  </div>
                </div>
                <div class="d-flex align-items-center flex-wrap gap-2">
                  <!-- <span
                    class="py-1 px-2 fs-12 bg-soft-danger rounded text-danger fw-medium"
                  >
                    <i class="ti ti-lock me-1"></i>Private
                  </span> -->
                  <div class="dropdown">
                    <a
                      href="#"
                      class="btn btn-xs btn-success fs-12 py-1 px-2 fw-medium d-inline-flex align-items-center"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i class="ti ti-thumb-up me-1"></i>{order?.status}<i
                        class="ti ti-chevron-down ms-1"
                      ></i>
                    </a>
                    <div class="dropdown-menu dropdown-menu-right">
                      <a class="dropdown-item" href="javascript:void(0);"
                        ><span>Won</span></a
                      >
                      <a class="dropdown-item" href="javascript:void(0);"
                        ><span>Lost</span></a
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- /Contact User -->
        </div>

        <!-- Contact Sidebar -->
        <div class="col-xl-4">
          <div class="card">
            <div class="card-body p-3">
              <h6 class="mb-3 fw-semibold">Order Information</h6>
              <div class="border-bottom mb-3 pb-3">
                <div
                  class="d-flex align-items-center justify-content-between mb-2"
                >
                  <p class="mb-0">Date Created</p>
                  <p class="mb-0 text-dark">
                    {order?.createdAt &&
                      new Date(order.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                  </p>
                </div>
                <div
                  class="d-flex align-items-center justify-content-between mb-2"
                >
                  <p class="mb-0">Price Terms</p>
                  <p class="mb-0 text-dark">{order?.priceTerms}</p>
                </div>
                <div
                  class="d-flex align-items-center justify-content-between mb-2"
                >
                  <p class="mb-0">Price</p>
                  <p class="mb-0 text-dark">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    })
                      .format(order?.price || 0)
                      .replace("₹", "₹ ")}
                  </p>
                </div>
                <div
                  class="d-flex align-items-center justify-content-between mb-2"
                >
                  <p class="mb-0">Start Date</p>
                  <p class="mb-0 text-dark">
                    {order?.startDate &&
                      new Date(order.startDate).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                  </p>
                </div>
                <div
                  class="d-flex align-items-center justify-content-between mb-2"
                >
                  <p class="mb-0">Deadline Date</p>
                  <p class="mb-0 text-dark">
                    {order?.deadlineDate &&
                      new Date(order.deadlineDate).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                  </p>
                </div>
                <div
                  class="d-flex align-items-center justify-content-between mb-2"
                >
                  <p class="mb-0">Source</p>
                  <p class="mb-0 text-dark">{order?.source}</p>
                </div>
              </div>
              <div
                class="d-flex align-items-center justify-content-between flex-wrap"
              >
                <h6 class="mb-3 fw-semibold">Order Owner</h6>
              </div>
              <div class="border-bottom mb-3 pb-3">
                <div class="d-flex align-items-center">
                  <span class="avatar avatar-xs rounded-circle me-2">
                    <img
                      src="/assets/img/users/avatar-4.jpg"
                      alt="Img"
                      class="img-fluid rounded-circle w-auto h-auto"
                    />
                  </span>
                  <div>
                    <p class="mb-0">{order?.orderClient?.name}</p>
                  </div>
                </div>
              </div>
              <!-- <h6 class="mb-3 fw-semibold">Tags</h6>
              <div class="border-bottom mb-3 pb-3">
                <a
                  href="javascript:void(0);"
                  class="badge badge-soft-success fw-medium me-2">Collab</a
                >
                <a
                  href="javascript:void(0);"
                  class="badge badge-soft-warning fw-medium mb-0">VIP</a
                >
              </div>
              <h6 class="mb-3 fw-semibold">Priority</h6>
              <div class="border-bottom mb-3 pb-3">
                <select class="select">
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <h6 class="mb-3 fw-semibold">Projects</h6>
              <div class="d-flex align-items-center border-bottom mb-3 pb-3">
                <span class="badge bg-white text-body fw-medium border me-2"
                  >Devops Design</span
                >
                <span class="badge bg-white text-body fw-medium border me-2"
                  >Margrate Design</span
                >
              </div> -->
              <!-- <div
                class="d-flex align-items-center justify-content-between flex-wrap"
              >
                <h6 class="mb-3 fw-semibold">Conracts</h6>
                <a
                  href="javascript:void(0);"
                  class="link-primary mb-3"
                  data-bs-toggle="modal"
                  data-bs-target="#add_contact"
                  ><i class="ti ti-plus me-1"></i>Add New</a
                >
              </div>
              <div class="mb-3">
                <div class="d-flex align-items-center">
                  <span class="avatar avatar-xs rounded-circle me-2">
                    <img
                      src="/assets/img/users/avatar-3.jpg"
                      alt="Img"
                      class="img-fluid rounded-circle w-auto h-auto"
                    />
                  </span>
                  <div>
                    <p class="mb-0">Steve Vaughan</p>
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <div class="d-flex align-items-center">
                  <span class="avatar avatar-xs rounded-circle me-2">
                    <img
                      src="/assets/img/users/avatar-4.jpg"
                      alt="Img"
                      class="img-fluid rounded-circle w-auto h-auto"
                    />
                  </span>
                  <div>
                    <p class="mb-0">Jessica Sen</p>
                  </div>
                </div>
              </div> -->
              <div
                class="d-flex align-items-center justify-content-between mb-2"
              >
                <p class="mb-0">Last Modified</p>
                <p class="mb-0 text-dark">
                  {order?.updatedAt &&
                    new Date(order.updatedAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                </p>
              </div>
              <div
                class="d-flex align-items-center justify-content-between mb-0"
              >
                <p class="mb-0">Modified By</p>
                <div class="d-flex align-items-center">
                  <span class="avatar avatar-xs rounded-circle me-2">
                    <img
                      src="/assets/img/users/avatar-2.jpg"
                      alt="Img"
                      class="img-fluid rounded-circle w-auto h-auto"
                    />
                  </span>
                  <div>
                    <p class="mb-0">{order?.user?.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- /Contact Sidebar -->

        <!-- Contact Details -->
        <div class="col-xl-8">
          <div class="mb-3 pb-3 border-bottom">
            <h5 class="mb-3">Deals Pipeline Status</h5>
            <div class="step-progress d-flex flex-wrap gap-2">
              <div class="step bg-indigo">Quality To Buy</div>
              <div class="step bg-warning">Contact Made</div>
              <div class="step bg-orange">Presentation</div>
              <div class="step bg-pink">Proposal Made</div>
              <div class="step appointment">Appointment</div>
            </div>
          </div>
          <div class="card mb-3">
            <div class="card-body pb-0 pt-2 px-2">
              <ul class="nav nav-tabs nav-bordered border-0 mb-0">
                <li class="nav-item" role="presentation">
                  <a
                    href="#tab_1"
                    data-bs-toggle="tab"
                    aria-expanded="false"
                    class="nav-link active border-3"
                    class:active={activeTab === "Activity"}
                    on:click|preventDefault={() => (activeTab = "Activity")}
                    aria-selected={activeTab === "Activity"}
                    role="tab"
                  >
                    <span class="d-md-inline-block">
                      <i class="ti ti-alarm-minus me-1"></i>Activities
                    </span>
                  </a>
                </li>
                <li class="nav-item" role="presentation">
                  <a
                    href="#tab_2"
                    data-bs-toggle="tab"
                    aria-expanded="true"
                    class="nav-link border-3"
                    class:active={activeTab === "Notes"}
                    on:click|preventDefault={() => (activeTab = "Notes")}
                    aria-selected={activeTab === "Notes"}
                    role="tab"
                    tabindex="-1"
                  >
                    <span class="d-md-inline-block">
                      <i class="ti ti-notes me-1"></i>Notes
                    </span>
                  </a>
                </li>
                <li class="nav-item" role="presentation">
                  <a
                    href="#tab_3"
                    data-bs-toggle="tab"
                    aria-expanded="false"
                    class="nav-link border-3"
                    class:active={activeTab === "Calls"}
                    on:click|preventDefault={() => (activeTab = "Calls")}
                    aria-selected={activeTab === "Calls"}
                    tabindex="-1"
                    role="tab"
                  >
                    <span class="d-md-inline-block">
                      <i class="ti ti-phone me-1"></i>Calls
                    </span>
                  </a>
                </li>
                <li class="nav-item" role="presentation">
                  <a
                    href="#tab_4"
                    data-bs-toggle="tab"
                    aria-expanded="false"
                    class="nav-link border-3"
                    class:active={activeTab === "Files"}
                    on:click|preventDefault={() => (activeTab = "Files")}
                    aria-selected={activeTab === "Files"}
                    tabindex="-1"
                    role="tab"
                  >
                    <span class="d-md-inline-block">
                      <i class="ti ti-file me-1"></i>Files
                    </span>
                  </a>
                </li>
                <li class="nav-item" role="presentation">
                  <a
                    href="#tab_5"
                    data-bs-toggle="tab"
                    aria-expanded="false"
                    class="nav-link border-3"
                    class:active={activeTab === "Email"}
                    on:click|preventDefault={() => (activeTab = "Email")}
                    aria-selected={activeTab === "Email"}
                    tabindex="-1"
                    role="tab"
                  >
                    <span class="d-md-inline-block">
                      <i class="ti ti-mail-check me-1"></i>Email
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <!-- Tab Content -->
          <div class="tab-content pt-0">
            {#if activeTab === "Activity"}
              <!-- Activities -->
              <div class="tab-pane active show" id="tab_1">
                <div class="card">
                  <div
                    class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3"
                  >
                    <h5 class="fw-semibold mb-0">Activities</h5>
                  </div>
                  <div class="card-body">
                    <div class="badge badge-soft-info border-0 mb-3">
                      <i class="ti ti-calendar-check me-1"></i>28 May 2025
                    </div>
                    <div class="card border shadow-none mb-3">
                      <div class="card-body p-3">
                        <div class="d-flex flex-wrap row-gap-2">
                          <span
                            class="avatar avatar-md flex-shrink-0 rounded me-2 bg-info"
                          >
                            <i class="ti ti-mail-code fs-20"></i>
                          </span>
                          <div>
                            <h6 class="fw-medium fs-14 mb-1">
                              You sent 1 Message to the contact.
                            </h6>
                            <p class="mb-0">10:25 pm</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- /Activities -->
            {/if}

            {#if activeTab === "Notes"}
              <!-- Notes -->
              <div class="tab-pane active show" id="tab_2">
                <div class="card">
                  <div
                    class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3"
                  >
                    <h5 class="fw-semibold mb-0">Notes</h5>
                  </div>
                  <div class="card-body">
                    <div class="notes-activity">
                      <div class="card mb-3">
                        <div class="card-body">
                          <div
                            class="d-flex align-items-center justify-content-between flex-wrap row-gap-2 pb-2"
                          >
                            <div class="d-inline-flex align-items-center mb-2">
                              <span class="avatar avatar-md me-2 flex-shrink-0">
                                <img
                                  src="/assets/img/profiles/avatar-19.jpg"
                                  alt="img"
                                />
                              </span>
                              <div>
                                <h6 class="fw-medium fs-14 mb-1">
                                  Darlee Robertson
                                </h6>
                                <p class="mb-0 fs-13">15 Sep 2023, 12:10 pm</p>
                              </div>
                            </div>
                            <div class="mb-2">
                              <div class="dropdown">
                                <a
                                  href="#"
                                  class="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                  ><i class="ti ti-dots-vertical"></i></a
                                >
                                <div class="dropdown-menu dropdown-menu-right">
                                  <a
                                    class="dropdown-item"
                                    href="javascript:void(0);"
                                    data-bs-toggle="modal"
                                    data-bs-target="#edit_notes"
                                    ><i class="ti ti-edit me-1"></i>Edit</a
                                  >
                                  <a
                                    class="dropdown-item"
                                    href="javascript:void(0);"
                                    data-bs-toggle="modal"
                                    data-bs-target="#delete_note"
                                    ><i class="ti ti-trash me-1"></i>Delete</a
                                  >
                                </div>
                              </div>
                            </div>
                          </div>
                          <h5 class="fw-medium fs-14 mb-1">
                            Notes added by Antony
                          </h5>
                          <p class="mb-3">
                            A project review evaluates the success of an
                            initiative and identifies areas for improvement. It
                            can also evaluate a current project to determine
                            whether it's on the right track. Or, it can
                            determine the success of a completed project.
                          </p>
                          <div class="row">
                            <div class="col-xxl-4 col-lg-5">
                              <div class="card">
                                <div class="card-body p-2">
                                  <div
                                    class="d-flex align-items-center justify-content-between flex-wrap row-gap-3"
                                  >
                                    <div class="d-flex align-items-center me-3">
                                      <span class="avatar bg-success me-2">
                                        <i class="ti ti-file-spreadsheet fs-20"
                                        ></i>
                                      </span>
                                      <div>
                                        <h6 class="fw-medium fs-14 mb-1">
                                          Project Specs.xls
                                        </h6>
                                        <p class="mb-0">365 KB</p>
                                      </div>
                                    </div>
                                    <a
                                      href="javascript:void(0);"
                                      class="avatar avatar-xs rounded-circle bg-light text-dark"
                                      ><i class="ti ti-arrow-down"></i></a
                                    >
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div class="col-xxl-4 col-lg-5">
                              <div class="card bg-light">
                                <div class="card-body p-2">
                                  <div
                                    class="d-flex align-items-center justify-content-between flex-wrap row-gap-3"
                                  >
                                    <div class="d-flex align-items-center me-3">
                                      <span class="avatar bg-success me-2">
                                        <img
                                          src="/assets/img/media/media-35.jpg"
                                          alt="img"
                                        />
                                      </span>
                                      <div>
                                        <h6 class="fw-medium fs-14 mb-1">
                                          637.jpg
                                        </h6>
                                        <p class="mb-0">365 KB</p>
                                      </div>
                                    </div>
                                    <a
                                      href="javascript:void(0);"
                                      class="avatar avatar-xs rounded-circle bg-white text-dark"
                                      ><i class="ti ti-arrow-down"></i></a
                                    >
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="notes-editor">
                            <div class="note-edit-wrap">
                              <div class="editor pages-editor"></div>
                              <div class="text-end note-btns mt-3">
                                <a
                                  href="javascript:void(0);"
                                  class="btn btn-light add-cancel me-2"
                                  >Cancel</a
                                >
                                <a
                                  href="javascript:void(0);"
                                  class="btn btn-primary">Save</a
                                >
                              </div>
                            </div>
                            <div class="text-end mt-2">
                              <a
                                href="javascript:void(0);"
                                class="add-comment link-primary fw-medium"
                                ><i class="ti ti-circle-plus me-1"></i>Add
                                Comment</a
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- /Notes -->
            {/if}

            {#if activeTab === "Calls"}
              <!-- Calls -->
              <div class="tab-pane active show" id="tab_3">
                <div class="card">
                  <div
                    class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3"
                  >
                    <h5 class="fw-semibold mb-0">Calls</h5>
                    <div class="d-inline-flex align-items-center">
                      <a
                        href="javascript:void(0);"
                        data-bs-toggle="modal"
                        data-bs-target="#create_call"
                        class="link-primary fw-medium"
                        ><i class="ti ti-circle-plus me-1"></i>Add New</a
                      >
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="card mb-3">
                      <div class="card-body">
                        <div
                          class="d-sm-flex align-items-center justify-content-between pb-2"
                        >
                          <div class="d-flex align-items-center mb-2">
                            <span class="avatar avatar-md me-2 flex-shrink-0">
                              <img
                                src="/assets/img/profiles/avatar-19.jpg"
                                alt="img"
                              />
                            </span>
                            <p class="mb-0">
                              <span class="text-dark fw-medium"
                                >Darlee Robertson</span
                              >
                              logged a call on 23 Jul 2023, 10:00 pm
                            </p>
                          </div>
                          <div class="d-inline-flex align-items-center mb-2">
                            <div class="dropdown me-2">
                              <a
                                href="#"
                                class="btn btn-sm btn-outline-light"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                >Busy<i class="ti ti-chevron-down ms-2"></i></a
                              >
                              <div class="dropdown-menu dropdown-menu-right">
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);">Busy</a
                                >
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);">No Answer</a
                                >
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);">Unavailable</a
                                >
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);">Wrong Number</a
                                >
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);"
                                  >Left Voice Message</a
                                >
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);">Moving Forward</a
                                >
                              </div>
                            </div>
                            <div class="dropdown">
                              <a
                                href="#"
                                class="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                ><i class="ti ti-dots-vertical"></i></a
                              >
                              <div class="dropdown-menu dropdown-menu-right">
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit_call"
                                  ><i class="ti ti-edit me-1"></i>Edit</a
                                >
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_call"
                                  ><i class="ti ti-trash me-1"></i>Delete</a
                                >
                              </div>
                            </div>
                          </div>
                        </div>
                        <p class="mb-0">
                          A project review evaluates the success of an
                          initiative and identifies areas for improvement. It
                          can also evaluate a current project to determine
                          whether it's on the right track. Or, it can determine
                          the success of a completed project.
                        </p>
                      </div>
                    </div>
                    <div class="card mb-3">
                      <div class="card-body">
                        <div
                          class="d-sm-flex align-items-center justify-content-between pb-2"
                        >
                          <div class="d-flex align-items-center mb-2">
                            <span class="avatar avatar-md me-2 flex-shrink-0">
                              <img
                                src="/assets/img/profiles/avatar-20.jpg"
                                alt="img"
                              />
                            </span>
                            <p class="mb-0">
                              <span class="text-dark fw-medium">Sharon Roy</span
                              >
                              logged a call on 18 Sep 2025, 09:52AM
                            </p>
                          </div>
                          <div class="d-inline-flex align-items-center mb-2">
                            <div class="dropdown me-2">
                              <a
                                href="#"
                                class="btn btn-sm btn-outline-light"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                >No Answrer<i class="ti ti-chevron-down ms-2"
                                ></i></a
                              >
                              <div class="dropdown-menu dropdown-menu-right">
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);">No Answrer</a
                                >
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);">Unavailable</a
                                >
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);">Wrong Number</a
                                >
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);"
                                  >Left Voice Message</a
                                >
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);">Moving Forward</a
                                >
                              </div>
                            </div>
                            <div class="dropdown">
                              <a
                                href="#"
                                class="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                ><i class="ti ti-dots-vertical"></i></a
                              >
                              <div class="dropdown-menu dropdown-menu-right">
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit_call"
                                  ><i class="ti ti-edit me-1"></i>Edit</a
                                >
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_call"
                                  ><i class="ti ti-trash me-1"></i>Delete</a
                                >
                              </div>
                            </div>
                          </div>
                        </div>
                        <p class="mb-0">
                          A project plan typically contains a list of the
                          essential elements of a project, such as stakeholders,
                          scope, timelines, estimated cost and communication
                          methods. The project manager typically lists the
                          information based on the assignment.
                        </p>
                      </div>
                    </div>
                    <div class="card mb-0">
                      <div class="card-body">
                        <div
                          class="d-sm-flex align-items-center justify-content-between pb-2"
                        >
                          <div class="d-flex align-items-center mb-2">
                            <span class="avatar avatar-md me-2 flex-shrink-0">
                              <img
                                src="/assets/img/profiles/avatar-21.jpg"
                                alt="img"
                              />
                            </span>
                            <p class="mb-0">
                              <span class="text-dark fw-medium">Vaughan</span>
                              logged a call on 20 Sep 2025, 10:26 PM
                            </p>
                          </div>
                          <div class="d-inline-flex align-items-center mb-2">
                            <div class="dropdown me-2">
                              <a
                                href="#"
                                class="btn btn-sm btn-outline-light"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                >No Answrer<i class="ti ti-chevron-down ms-2"
                                ></i></a
                              >
                              <div class="dropdown-menu dropdown-menu-right">
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);">No Answrer</a
                                >
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);">Unavailable</a
                                >
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);">Wrong Number</a
                                >
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);"
                                  >Left Voice Message</a
                                >
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);">Moving Forward</a
                                >
                              </div>
                            </div>
                            <div class="dropdown">
                              <a
                                href="#"
                                class="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                ><i class="ti ti-dots-vertical"></i></a
                              >
                              <div class="dropdown-menu dropdown-menu-right">
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit_call"
                                  ><i class="ti ti-edit me-1"></i>Edit</a
                                >
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0);"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_call"
                                  ><i class="ti ti-trash me-1"></i>Delete</a
                                >
                              </div>
                            </div>
                          </div>
                        </div>
                        <p class="mb-0">
                          Projects play a crucial role in the success of
                          organizations, and their importance cannot be
                          overstated. Whether it's launching a new product,
                          improving an existing
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- /Calls -->
            {/if}

            {#if activeTab === "Files"}
              <!-- Files -->
              <div class="tab-pane active show" id="tab_4">
                <div class="card">
                  <div class="card-header">
                    <h5 class="fw-semibold mb-0">Files</h5>
                  </div>
                  <div class="card-body">
                    <div class="card border mb-3">
                      <div class="card-body pb-0">
                        <div class="row align-items-center">
                          <div class="col-md-8">
                            <div class="mb-3">
                              <h6 class="mb-1">Manage Documents</h6>
                              <p>
                                Send customizable quotes, proposals and
                                contracts to close deals faster.
                              </p>
                            </div>
                          </div>
                          <div class="col-md-4 text-md-end">
                            <div class="mb-3">
                              <a
                                href="#"
                                class="btn btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#new_file">Create Document</a
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="card border shadow-none mb-3">
                      <div class="card-body pb-0">
                        <div class="row align-items-center">
                          <div class="col-md-8">
                            <div class="mb-3">
                              <h6 class="fw-semibold fs-14 mb-1">
                                Collier-Turner Proposal
                              </h6>
                              <p>
                                Send customizable quotes, proposals and
                                contracts to close deals faster.
                              </p>
                              <div
                                class="d-flex align-items-center flex-wrap row-gap-2"
                              >
                                <span
                                  class="avatar avatar-md me-2 flex-shrink-0"
                                >
                                  <img
                                    src="/assets/img/profiles/avatar-21.jpg"
                                    alt="img"
                                    class="rounded-circle"
                                  />
                                </span>
                                <div class="d-flex align-items-center">
                                  <p class="mb-0 me-2">Vaughan Lewis</p>
                                  <span class="badge bg-light text-body"
                                    >Owner</span
                                  >
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="col-md-4 text-md-end">
                            <div class="mb-3 d-inline-flex align-items-center">
                              <span class="badge badge-soft-danger me-1"
                                >Proposal</span
                              >
                              <span class="badge bg-info me-1">Draft</span>
                              <div class="dropdown">
                                <a
                                  href="#"
                                  class="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                  ><i class="ti ti-dots-vertical"></i></a
                                >
                                <div class="dropdown-menu dropdown-menu-right">
                                  <a
                                    class="dropdown-item"
                                    href="javascript:void(0);"
                                    data-bs-toggle="modal"
                                    data-bs-target="#delete_file"
                                  >
                                    <i class="ti ti-trash me-1"></i>Delete
                                  </a>
                                  <a
                                    class="dropdown-item"
                                    href="javascript:void(0);"
                                  >
                                    <i class="ti ti-download me-1"></i>Download
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="card border shadow-none mb-3">
                      <div class="card-body pb-0">
                        <div class="row align-items-center">
                          <div class="col-md-8">
                            <div class="mb-3">
                              <h6 class="fw-semibold fs-14 mb-1">
                                Collier-Turner Proposal
                              </h6>
                              <p>
                                Send customizable quotes, proposals and
                                contracts to close deals faster.
                              </p>
                              <div
                                class="d-flex align-items-center flex-wrap row-gap-2"
                              >
                                <span
                                  class="avatar avatar-md me-2 flex-shrink-0"
                                >
                                  <img
                                    src="/assets/img/profiles/avatar-01.jpg"
                                    alt="img"
                                    class="rounded-circle"
                                  />
                                </span>
                                <div class="d-flex align-items-center">
                                  <p class="mb-0 me-2">Jessica Louise</p>
                                  <span class="badge bg-light text-body"
                                    >Owner</span
                                  >
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="col-md-4 text-md-end">
                            <div class="mb-3 d-inline-flex align-items-center">
                              <span class="badge badge-purple-light me-1"
                                >Quote</span
                              >
                              <span class="badge bg-success me-1">Sent</span>
                              <div class="dropdown">
                                <a
                                  href="#"
                                  class="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                  ><i class="ti ti-dots-vertical"></i></a
                                >
                                <div class="dropdown-menu dropdown-menu-right">
                                  <a
                                    class="dropdown-item"
                                    href="javascript:void(0);"
                                    data-bs-toggle="modal"
                                    data-bs-target="#delete_file"
                                  >
                                    <i class="ti ti-trash me-1"></i>Delete
                                  </a>
                                  <a
                                    class="dropdown-item"
                                    href="javascript:void(0);"
                                  >
                                    <i class="ti ti-download me-1"></i>Download
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="card border shadow-none mb-0">
                      <div class="card-body pb-0">
                        <div class="row align-items-center">
                          <div class="col-md-8">
                            <div class="mb-3">
                              <h6 class="fw-semibold fs-14 mb-1">
                                Collier-Turner Proposal
                              </h6>
                              <p>
                                Send customizable quotes, proposals and
                                contracts to close deals faster.
                              </p>
                              <div
                                class="d-flex align-items-center flex-wrap row-gap-2"
                              >
                                <span
                                  class="avatar avatar-md me-2 flex-shrink-0"
                                >
                                  <img
                                    src="/assets/img/profiles/avatar-22.jpg"
                                    alt="img"
                                    class="rounded-circle"
                                  />
                                </span>
                                <div class="d-flex align-items-center">
                                  <p class="mb-0 me-2">Dawn Merhca</p>
                                  <span class="badge bg-light text-body"
                                    >Owner</span
                                  >
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="col-md-4 text-md-end">
                            <div class="mb-3 d-inline-flex align-items-center">
                              <span class="badge badge-danger-light me-1"
                                >Proposal</span
                              >
                              <span class="badge bg-pending priority-badge me-1"
                                >Draft</span
                              >
                              <div class="dropdown">
                                <a
                                  href="#"
                                  class="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                  ><i class="ti ti-dots-vertical"></i></a
                                >
                                <div class="dropdown-menu dropdown-menu-right">
                                  <a
                                    class="dropdown-item"
                                    href="javascript:void(0);"
                                    data-bs-toggle="modal"
                                    data-bs-target="#delete_file"
                                  >
                                    <i class="ti ti-trash me-1"></i>Delete
                                  </a>
                                  <a
                                    class="dropdown-item"
                                    href="javascript:void(0);"
                                  >
                                    <i class="ti ti-download me-1"></i>Download
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- /Files -->
            {/if}

            {#if activeTab === "Email"}
              <!-- Email -->
              <div class="tab-pane active show" id="tab_5">
                <div class="card">
                  <div
                    class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3"
                  >
                    <h5 class="mb-1">Email</h5>
                    <div class="d-inline-flex align-items-center">
                      <a
                        href="javascript:void(0);"
                        class="link-primary fw-medium"
                        data-bs-toggle="tooltip"
                        data-bs-placement="left"
                        data-bs-custom-class="tooltip-dark"
                        data-bs-original-title="There are no email accounts configured, Please configured your email account in order to Send/ Create EMails"
                        ><i class="ti ti-circle-plus me-1"></i>Create Email</a
                      >
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="card border mb-0">
                      <div class="card-body pb-0">
                        <div class="row align-items-center">
                          <div class="col-md-8">
                            <div class="mb-3">
                              <h6 class="mb-1">Manage Emails</h6>
                              <p>
                                You can send and reply to emails directly via
                                this section.
                              </p>
                            </div>
                          </div>
                          <div class="col-md-4 text-md-end">
                            <div class="mb-3">
                              <a
                                href="#"
                                class="btn btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#create_email"
                                >Connect Account</a
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- /Email -->
            {/if}
          </div>
          <!-- /Tab Content -->
        </div>
        <!-- /Contact Details -->
      </div>
    {:else}
      <div class="row">
        <div class="col-md-12">Loading order details...</div>
      </div>
    {/if}
    <!-- Start Footer -->
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
    <h5 class="mb-0">Update Order</h5>
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
          {loading ? "Updating..." : "Update New"}
        </button>
      </div>
    </form>
  </div>
</div>
<!-- /Add Canvas -->
