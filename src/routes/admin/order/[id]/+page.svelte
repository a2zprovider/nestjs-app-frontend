<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import jQuery from "jquery";
  import { page } from "$app/stores";
  import { authApiFetch } from "$lib/api/client";
  import { errorHandle } from "$lib/utils/errorHandle";
  import { API_ROUTES } from "$lib/constants/apiRoutes";
  import Swal from "sweetalert2";

  let errorMessage = "";
  let order = null;
  let users = [];
  let updateMount = true;

  // let showMessageModal = false;
  // const modalProps = {
  //   type: "success",
  //   title: "Success!!",
  //   message: "Order Created Successfully.",
  //   confirmText: "Ok",
  //   onConfirm: () => {
  //     console.log("Ok");
  //   },
  // };

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

  let aTitle = "";
  let link = "";
  let file = "";

  let type = "";
  let message = "";

  let seletedUsers = [];

  let loading = false;

  // Field-specific error messages
  let formErrors = {};

  function closeModalMenual(id) {
    const $ = jQuery;
    $(id).removeClass("show d-block");
    $(".modal-backdrop").removeClass("show");

    setTimeout(() => {
      $(".modal-backdrop").remove();
      $(id).removeClass("d-block");
      $("body").removeClass("modal-open");
      $("body").css({ overflow: "", paddingRight: "" });
    }, 300);
  }

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
      const data = await authApiFetch(API_ROUTES.ORDER + "/" + order.id, {
        method: "PUT",
        data: JSON.stringify(updateOrder),
      });
      console.log("data  : ", data);

      order = data.data;
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

  let orderId;
  $: orderId = $page.params.id;

  onMount(async () => {
    try {
      const data = await authApiFetch(`${API_ROUTES.ORDER}/${orderId}`);
      order = data;

      // update params
      title = data?.title;
      category = data?.category;
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

      data?.assignedUsers.map((user) => {
        if (user?.role == "user") {
          seletedUsers.push(user?.id);
        }
      });
    } catch (err) {
      errorMessage = "Failed to load order data.";
    }
  });

  onMount(async () => {
    try {
      const data = await authApiFetch(API_ROUTES.USER);
      users = data.data;
    } catch (err) {
      errorMessage = "Failed to load user data.";
    }
  });

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

  function getAvatarText(title) {
    if (!title) return "";
    const words = title.trim().split(" ");
    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  async function deleteOrder(id) {
    try {
      Swal.fire({
        title: "Delete Confirmation",
        text: "Are you sure you want to delete this record.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const data = await authApiFetch(API_ROUTES.ORDER + "/" + id, {
            method: "DELETE",
          });
          Swal.fire("Deleted!", data.message, "success");
          goto("/admin/order");
        }
      });
    } catch (error) {
      const validationErrors = errorHandle(error);

      if (validationErrors && typeof validationErrors === "object") {
        formErrors = validationErrors;
      } else {
        errorMessage = "An unexpected error occurred.";
      }
    } finally {
      console.log("formErrors : ", formErrors);
    }
  }

  async function addAttachment(e) {
    e.preventDefault();
    errorMessage = "";
    loading = true;
    formErrors = {};

    const attachmentPayload = {
      title: aTitle,
      link,
      file,
    };
    if (order) {
      attachmentPayload.orderId = order.id;
    }

    try {
      const data = await authApiFetch(API_ROUTES.ORDER_ATTACHMENT, {
        method: "POST",
        data: JSON.stringify(attachmentPayload),
      });

      if (data) {
        order.orderAttachments = [data.data, ...order.orderAttachments];
        Swal.fire("Success!", data.message, "success");
        closeModalMenual("#new_file");
      }
    } catch (error) {
      const validationErrors = errorHandle(error);
      console.log("validationErrors:", validationErrors);

      if (validationErrors && typeof validationErrors === "object") {
        formErrors = validationErrors;
      } else {
        errorMessage = "An unexpected error occurred.";
        console.error("Unexpected error:", error);
      }
    } finally {
      console.log("formErrors:", formErrors);
      loading = false;
    }
  }

  async function addChat(e) {
    e.preventDefault();
    errorMessage = "";
    loading = true;
    formErrors = {};

    const chatPayload = {
      type,
      message,
    };
    if (order) {
      chatPayload.orderId = order.id;
    }

    try {
      const data = await authApiFetch(API_ROUTES.ORDER_CHAT, {
        method: "POST",
        data: JSON.stringify(chatPayload),
      });

      if (data) {
        console.log("data : ", data);
        console.log("order.orderChats - old : ", order.orderChats);
        order.orderChats = [data.data, ...order.orderChats];
        console.log("order : ", order);

        Swal.fire("Success!", data.message, "success");
        closeModalMenual("#create_call");
      }
    } catch (error) {
      const validationErrors = errorHandle(error);
      console.log("validationErrors:", validationErrors);

      if (validationErrors && typeof validationErrors === "object") {
        formErrors = validationErrors;
      } else {
        errorMessage = "An unexpected error occurred.";
        console.error("Unexpected error:", error);
      }
    } finally {
      console.log("formErrors:", formErrors);
      loading = false;
    }
  }

  async function addAssignedUser(event) {
    event.preventDefault();
    errorMessage = "";
    loading = true;
    formErrors = {};

    const updateOrder = {
      title,
    };
    let newAssignedUsers = [];
    newAssignedUsers = seletedUsers
      .map((id) => users.find((u) => u.id === id))
      .filter(Boolean);
    const existingAdminUsers = order.assignedUsers.filter(
      (user) => user.role === "admin"
    );
    updateOrder.assignedUsers = [...newAssignedUsers, ...existingAdminUsers];

    if (!updateOrder?.assignedUsers?.length) {
      Swal.fire("Warning!", "Please select one user for assign.", "warning");
      loading = false;
    } else {
      try {
        const data = await authApiFetch(API_ROUTES.ORDER + "/" + order.id, {
          method: "PUT",
          data: JSON.stringify(updateOrder),
        });
        console.log("data  : ", data);

        order = data.data;
        Swal.fire("Success!", data.message, "success");
        closeModalMenual("#add_contact");
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
  }

  let activeTab = "Activity";

  let statusesColors = {
    "New Lead": "bg-blue",
    Contacted: "bg-purple",
    "Follow Up": "bg-yellow",
    Qualified: "bg-[#2ecc71]",
    Unqualified: "bg-[#e74c3c]",
    "Needs Assessment": "bg-orange",
    "Quotation Sent": "bg-teal",
    "Negotiation In Progress": "bg-amber",
    "Deal Won": "bg-green",
    "Deal Lost": "bg-red",
  };
  function setAssignedUsers() {
    console.log("order?.assignedUsers :", order?.assignedUsers);
    console.log("seletedUsers :", seletedUsers);
    seletedUsers = [];
    order?.assignedUsers.map((user) => {
      if (user?.role == "user") {
        seletedUsers.push(user?.id);
      }
    });
  }
</script>

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
            <li class="breadcrumb-item"><a href="/admin">Home</a></li>
            <li class="breadcrumb-item"><a href="/admin/order">Orders</a></li>
            <li class="breadcrumb-item active" aria-current="page">Order</li>
          </ol>
        </nav>
      </div>
      <div class="gap-2 d-flex align-items-center flex-wrap">
        <div class="dropdown">
          <a
            href="#tag"
            class="dropdown-toggle btn btn-outline-light px-2 shadow"
            data-bs-toggle="dropdown"
            ><i class="ti ti-package-export me-2"></i>Export</a
          >
          <div class="dropdown-menu dropdown-menu-end">
            <ul>
              <li>
                <a href="#tag" class="dropdown-item"
                  ><i class="ti ti-file-type-pdf me-1"></i>Export as PDF</a
                >
              </li>
              <li>
                <a href="#tag" class="dropdown-item"
                  ><i class="ti ti-file-type-xls me-1"></i>Export as Excel
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
          data-bs-original-title="Refresh"><i class="ti ti-refresh"></i></a
        >
        <a
          href="#Collapse"
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
              <a href="/admin/order">
                <i class="ti ti-arrow-narrow-left me-1"></i>Back to Orders
              </a>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <button
                class="btn btn-secondary"
                on:click={() => deleteOrder(order?.id)}
              >
                <i class="ti ti-trash me-1"></i>Delete Order
              </button>
              <a
                href="#offcanvas_add"
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
                      href="#status"
                      class={`btn btn-xs bg-success fs-12 py-1 px-2 fw-medium d-inline-flex align-items-center text-white ${statusesColors[order?.status] || "bg-gray"}`}
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i class="ti ti-thumb-up me-1"></i>{order?.status}<i
                        class="ti ti-chevron-down ms-1"
                      ></i>
                    </a>
                    <div class="dropdown-menu dropdown-menu-right">
                      <a class="dropdown-item" href="#won"><span>Won</span></a>
                      <a class="dropdown-item" href="#lost"><span>Lost</span></a
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
                <a href="#tag" class="badge badge-soft-success fw-medium me-2"
                  >Collab</a
                >
                <a href="#tag" class="badge badge-soft-warning fw-medium mb-0"
                  >VIP</a
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
              <div
                class="d-flex align-items-center justify-content-between flex-wrap"
              >
                <h6 class="mb-3 fw-semibold">Assigned Users</h6>
                <a
                  on:click={() => setAssignedUsers()}
                  href="#tag"
                  class="link-primary mb-3"
                  data-bs-toggle="modal"
                  data-bs-target="#add_contact"
                >
                  <i class="ti ti-plus me-1"></i>Add New
                </a>
              </div>

              {#each order.assignedUsers as assignedUser}
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
                      <p class="mb-0">{assignedUser?.name}</p>
                    </div>
                  </div>
                </div>
              {/each}
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
                    <p class="mb-0">{order?.assignedUsers[0]?.name}</p>
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
                    class:active={activeTab === "Files"}
                    on:click|preventDefault={() => (activeTab = "Files")}
                    aria-selected={activeTab === "Files"}
                    role="tab"
                    tabindex="-1"
                  >
                    <span class="d-md-inline-block">
                      <i class="ti ti-file me-1"></i>Files
                    </span>
                  </a>
                </li>
                <li class="nav-item" role="presentation">
                  <a
                    href="#tab_3"
                    data-bs-toggle="tab"
                    aria-expanded="false"
                    class="nav-link border-3"
                    class:active={activeTab === "Chats"}
                    on:click|preventDefault={() => (activeTab = "Chats")}
                    aria-selected={activeTab === "Chats"}
                    tabindex="-1"
                    role="tab"
                  >
                    <span class="d-md-inline-block">
                      <i class="ti ti-brand-hipchat me-1"></i>Chats
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

            {#if activeTab === "Files"}
              <!-- Files -->
              <div class="tab-pane active show" id="tab_2">
                <div class="card">
                  <div
                    class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3"
                  >
                    <h5 class="fw-semibold mb-0">Files</h5>

                    <div class="d-inline-flex align-items-center">
                      <div class="dropdown me-2">
                        <a
                          href="#tag"
                          class="dropdown-toggle btn btn-outline-light px-2 shadow"
                          data-bs-toggle="dropdown"
                          ><i class="ti ti-sort-ascending-2 me-2"></i>Sort By</a
                        >
                        <div class="dropdown-menu">
                          <ul>
                            <li>
                              <a href="#Newest" class="dropdown-item">Newest</a>
                            </li>
                            <li>
                              <a href="#Oldest" class="dropdown-item">Oldest</a>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <button
                        href="#new_file"
                        data-bs-toggle="modal"
                        data-bs-target="#new_file"
                        class="link-primary fw-medium"
                        ><i class="ti ti-circle-plus me-1"></i>Add New</button
                      >
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="notes-activity">
                      {#if order?.orderAttachments.length}
                        {#each order.orderAttachments as attachment}
                          <div class="card mb-3">
                            <div class="card-body">
                              <div
                                class="d-flex align-items-center justify-content-between flex-wrap row-gap-2 pb-2"
                              >
                                <div
                                  class="d-inline-flex align-items-center mb-2"
                                >
                                  <span
                                    class="avatar avatar-md me-2 flex-shrink-0"
                                  >
                                    <img
                                      src="/assets/img/profiles/avatar-19.jpg"
                                      alt="img"
                                    />
                                  </span>
                                  <div>
                                    <h6 class="fw-medium fs-14 mb-1">
                                      {attachment?.user?.name}
                                    </h6>
                                    <p class="mb-0 fs-13">
                                      {attachment?.createdAt &&
                                        new Date(
                                          attachment.createdAt
                                        ).toLocaleString("en-GB", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        })}
                                    </p>
                                  </div>
                                </div>
                                <div class="mb-2">
                                  <div class="dropdown">
                                    <a
                                      href="#dropdown"
                                      class="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                                      data-bs-toggle="dropdown"
                                      aria-expanded="false"
                                    >
                                      <i class="ti ti-dots-vertical"></i>
                                    </a>
                                    <div
                                      class="dropdown-menu dropdown-menu-right"
                                    >
                                      <a
                                        class="dropdown-item"
                                        href="#tag"
                                        data-bs-toggle="modal"
                                        data-bs-target="#edit_notes"
                                        ><i class="ti ti-edit me-1"></i>Edit</a
                                      >
                                      <a
                                        class="dropdown-item"
                                        href="#tag"
                                        data-bs-toggle="modal"
                                        data-bs-target="#delete_note"
                                        ><i class="ti ti-trash me-1"
                                        ></i>Delete</a
                                      >
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <h5 class="fw-medium fs-14 mb-1">
                                {attachment?.title}
                              </h5>
                              <p class:mb-3={attachment?.file}>
                                {#if attachment?.link}
                                  Attachment Link :
                                  <a href={attachment?.link} target="_blank"
                                    >{attachment?.link}</a
                                  >
                                {/if}
                              </p>
                              {#if attachment?.file}
                                <div class="row">
                                  <div class="col-xxl-4 col-lg-5">
                                    <div class="card">
                                      <div class="card-body p-2">
                                        <div
                                          class="d-flex align-items-center justify-content-between flex-wrap row-gap-3"
                                        >
                                          <div
                                            class="d-flex align-items-center me-3"
                                          >
                                            <span
                                              class="avatar bg-success me-2"
                                            >
                                              <i
                                                class="ti ti-file-spreadsheet fs-20"
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
                                            href="#tag"
                                            class="avatar avatar-xs rounded-circle bg-light text-dark"
                                            ><i class="ti ti-arrow-down"></i></a
                                          >
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              {/if}
                            </div>
                          </div>
                        {/each}
                      {:else}
                        <div>No attachments found.</div>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
              <!-- /Notes -->
            {/if}

            {#if activeTab === "Chats"}
              <!-- Chats -->
              <div class="tab-pane active show" id="tab_3">
                <div class="card">
                  <div
                    class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3"
                  >
                    <h5 class="fw-semibold mb-0">Chats</h5>
                    <div class="d-inline-flex align-items-center">
                      <a
                        href="#create_call"
                        data-bs-toggle="modal"
                        data-bs-target="#create_call"
                        class="link-primary fw-medium"
                        ><i class="ti ti-circle-plus me-1"></i>Add New</a
                      >
                    </div>
                  </div>
                  <div class="card-body">
                    {#if order?.orderChats.length}
                      {#each order.orderChats as chat}
                        <div class="card mb-3">
                          <div class="card-body">
                            <div
                              class="d-sm-flex align-items-center justify-content-between pb-2"
                            >
                              <div class="d-flex align-items-center mb-2">
                                <span
                                  class="avatar avatar-md me-2 flex-shrink-0"
                                >
                                  <img
                                    src="/assets/img/profiles/avatar-19.jpg"
                                    alt="img"
                                  />
                                </span>
                                <p class="mb-0">
                                  <span class="text-dark fw-medium"
                                    >{order?.user?.name}</span
                                  >
                                  ........ on {chat?.createdAt &&
                                    new Date(chat.createdAt).toLocaleString(
                                      "en-GB",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      }
                                    )}
                                </p>
                              </div>
                              <div
                                class="d-inline-flex align-items-center mb-2"
                              >
                                <div class="dropdown me-2">
                                  <a
                                    href="#dropdown"
                                    class="btn btn-sm btn-outline-light"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    >Busy<i class="ti ti-chevron-down ms-2"
                                    ></i></a
                                  >
                                  <div
                                    class="dropdown-menu dropdown-menu-right"
                                  >
                                    <a class="dropdown-item" href="#busy"
                                      >Busy</a
                                    >
                                    <a class="dropdown-item" href="#tag"
                                      >No Answer</a
                                    >
                                    <a class="dropdown-item" href="#tag"
                                      >Unavailable</a
                                    >
                                    <a class="dropdown-item" href="#tag"
                                      >Wrong Number</a
                                    >
                                    <a class="dropdown-item" href="#tag"
                                      >Left Voice Message</a
                                    >
                                    <a class="dropdown-item" href="#tag"
                                      >Moving Forward</a
                                    >
                                  </div>
                                </div>
                                <div class="dropdown">
                                  <a
                                    href="#dropdown"
                                    class="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    ><i class="ti ti-dots-vertical"></i></a
                                  >
                                  <div
                                    class="dropdown-menu dropdown-menu-right"
                                  >
                                    <a
                                      class="dropdown-item"
                                      href="#tag"
                                      data-bs-toggle="modal"
                                      data-bs-target="#edit_call"
                                      ><i class="ti ti-edit me-1"></i>Edit</a
                                    >
                                    <a
                                      class="dropdown-item"
                                      href="#tag"
                                      data-bs-toggle="modal"
                                      data-bs-target="#delete_call"
                                      ><i class="ti ti-trash me-1"></i>Delete</a
                                    >
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p class="mb-0">
                              {chat?.message}
                            </p>
                          </div>
                        </div>
                      {/each}
                    {:else}
                      <div>No chats found.</div>
                    {/if}
                  </div>
                </div>
              </div>
              <!-- /Chats -->
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
                        href="#tag"
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
                                href="#create_email"
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

<!-- Add Attachment -->
<div class="modal fade" id="new_file" role="dialog">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Add New Attachment</h5>
        <button
          type="button"
          class="btn-close custom-btn-close border p-1 me-0 text-dark"
          data-bs-dismiss="modal"
          aria-label="Close"
        >
        </button>
      </div>
      <form
        on:submit={addAttachment}
        class="needs-validation space-y-4"
        novalidate
      >
        <div class="modal-body">
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="form-label" for="title">
                Title <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                name="title"
                class="form-control"
                class:is-invalid={formErrors.title}
                bind:value={aTitle}
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
              <label class="form-label" for="link"> Link </label>
              <input
                type="text"
                name="link"
                class="form-control"
                class:is-invalid={formErrors.link}
                bind:value={link}
                id="link"
                placeholder="Link"
              />
              {#if formErrors.link}
                <ul class="text-danger mt-1 text-xs capitalize">
                  <li>{formErrors.link[0]}</li>
                </ul>
              {/if}
            </div>
            <div>
              <label class="form-label" for="attachment">
                Attachment <span class="text-danger">*</span>
              </label>
              <div
                class="file-upload drag-file w-100 d-flex bg-light border shadow align-items-center justify-content-center flex-column"
              >
                <span class="upload-img d-block mb-1">
                  <i class="ti ti-folder-open text-primary fs-16"></i>
                </span>
                <p class="mb-0 fs-14 text-dark">
                  Drop your files here or <a
                    href="#browse"
                    class="text-decoration-underline text-primary">browse</a
                  >
                </p>
                <input type="file" accept="video/image" />
                <p class="fs-13 mb-0">Maximum size : 50 MB</p>
              </div>
              {#if formErrors.attachment}
                <ul class="text-danger mt-1 text-xs capitalize">
                  <li>{formErrors.attachment[0]}</li>
                </ul>
              {/if}
            </div>
          </div>
          <div class="modal-footer">
            <a class="btn btn-light" href="#cancel" data-bs-dismiss="modal"
              >Cancel</a
            >
            <button class="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Confirming..." : "Confirm"}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>
<!-- /Add Attachment -->

<!-- Create Chat -->
<div class="modal fade" id="create_call" role="dialog">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Create Chat</h5>
        <button
          type="button"
          class="btn-close custom-btn-close border p-1 me-0 text-dark"
          data-bs-dismiss="modal"
          aria-label="Close"
        >
        </button>
      </div>
      <form on:submit={addChat} class="needs-validation space-y-4" novalidate>
        <div class="modal-body">
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="form-label" for="type">
                Type <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                name="type"
                class="form-control"
                class:is-invalid={formErrors.type}
                bind:value={type}
                required
                id="type"
                placeholder="Type"
              />
              {#if formErrors.type}
                <ul class="text-danger mt-1 text-xs capitalize">
                  <li>{formErrors.type[0]}</li>
                </ul>
              {/if}
            </div>
            <div>
              <label class="form-label" for="message">
                Message <span class="text-danger">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                class="form-control"
                rows="4"
                bind:value={message}
                class:is-invalid={formErrors.message}
                required
              ></textarea>
              {#if formErrors.message}
                <ul class="text-danger mt-1 text-xs capitalize">
                  <li>{formErrors.message[0]}</li>
                </ul>
              {/if}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-light" data-bs-dismiss="modal"
            >Cancel</button
          >
          <button class="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create New"}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
<!-- /Create Chat -->

<!-- Add Assigned Users -->
<div class="modal custom-modal fade" id="add_contact" role="dialog">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Add Assigned Users</h5>
        <button
          class="btn-close custom-btn-close border p-1 me-0 text-dark"
          data-bs-dismiss="modal"
          aria-label="Close"
        >
          <i class="ti ti-x"></i>
        </button>
      </div>
      <div class="modal-body">
        <form
          on:submit={addAssignedUser}
          class="needs-validation space-y-4"
          novalidate
        >
          <div class="access-wrap">
            {#if users.length}
              <ul>
                {#each users as user}
                  <li class="select-people-checkbox">
                    <label class="checkboxs d-flex align-items-center mb-3">
                      <input
                        type="checkbox"
                        class="form-check-input me-2"
                        bind:group={seletedUsers}
                        value={user.id}
                      />
                      <span class="checkmarks"></span>
                      <span class="people-profile">
                        <img
                          src="/assets/img/profiles/avatar-19.jpg"
                          alt="img"
                          class="avatar avatar-sm rounded-circle"
                        />
                        <a href="#user">{user?.name}</a>
                      </span>
                    </label>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
          <div class="modal-btn text-end">
            <button
              type="button"
              href="#"
              class="btn btn-light"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button class="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Confirming..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
<!-- /Add Assigned Users -->
