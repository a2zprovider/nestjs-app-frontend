<script>
  import { onMount } from "svelte";
  import DynamicDataTable from "$lib/components/DynamicDataTable.svelte";
  import { goto } from "$app/navigation";
  import Header from "$lib/components/Header.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import { authApiFetch } from "../../lib/api/client";

  let users = [];
  let currentPage = 1;
  let rowsPerPage = 10;
  let searchTerm = "";
  let columns = [
    {
      key: "name",
      label: "Name",
      render: (val, row) => {
        return `<a href="/user/${row.id}"  class="flex items-center gap-1 text-danger">${row.name}</a>`;
        // return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()} ${String(d.getHours() % 12 || 12).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() >= 12 ? "PM" : "AM"}`;
      },
    },
    { key: "email", label: "Email" },
    {
      key: "createdAt",
      label: "Created At",
      render: (val, row) => {
        const d = new Date(row.createdAt);
        return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()} ${String(d.getHours() % 12 || 12).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() >= 12 ? "PM" : "AM"}`;
      },
    },
  ];

  let actions = [
    {
      label: "Edit",
      icon: "ti ti-edit",
      onClick: (id) => editRecord(id),
      color: "btn-soft-info",
    },
    {
      label: "Delete",
      icon: "ti ti-trash",
      onClick: (id) => deleteRecord(id),
      color: "btn-soft-danger",
    },
  ];
  async function fetchUsers() {
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
        search: searchTerm || "",
      });

      const data = await authApiFetch(`users?${query.toString()}`, {
        method: "GET",
      });

      users = data.data;
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  const editRecord = async (id) => {
    goto("/user/edit/" + id);
  };

  async function deleteRecord(id) {
    console.log(id);

    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await authApiFetch(`user/${id}`, { method: "DELETE" });
      users = users.filter((user) => user.id !== id); // Remove from local list
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  }

  onMount(fetchUsers);

  $: [searchTerm, currentPage, rowsPerPage], fetchUsers();
</script>

<Header />
<Sidebar />

<div class="page-wrapper">
  <!-- Start Content -->
  <div class="content pb-0">
    <!-- Page Header -->
    <div class="mb-4">
      <h4 class="mb-1">Users</h4>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-0 p-0">
          <li class="breadcrumb-item"><a href="/">Home</a></li>
          <li class="breadcrumb-item active" aria-current="page">Users</li>
        </ol>
      </nav>
    </div>
    <!-- End Page Header -->

    <!-- card start -->
    <div class="card border-0 rounded-0">
      <div
        class="card-header flex items-center justify-between gap-2 flex-wrap"
      >
        <div class="input-icon input-icon-start position-relative">
          <h5>Users List</h5>
        </div>
        <a
          href="/user/add"
          class="btn btn-primary"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvas_add"
          ><i class="ti ti-square-rounded-plus-filled me-1"></i>Add User</a
        >
      </div>
      <div class="card-body">
        <DynamicDataTable
          {columns}
          {actions}
          data={users}
          search={searchTerm}
          {currentPage}
          {rowsPerPage}
          totalItems={users.length}
          on:search={(e) => {
            searchTerm = e.detail;
            currentPage = 1; // reset to first page on new search
          }}
          on:pageChange={(e) => (currentPage = e.detail)}
          on:rowsPerPageChange={(e) => {
            rowsPerPage = e.detail;
            currentPage = 1; // reset to first page when limit changes
          }}
        />
      </div>
    </div>
    <!-- card end -->
  </div>
  <!-- End Content -->
</div>
