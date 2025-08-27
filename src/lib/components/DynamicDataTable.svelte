<script>
  import { createEventDispatcher } from "svelte";

  export let columns = [];
  export let data = [];
  export let actions = [];
  export let search = "";
  export let currentPage = 1;
  export let rowsPerPage = 10;

  const dispatch = createEventDispatcher();

  let sortColumn = "";
  let sortAsc = true;

  // Filtered rows based on search
  $: filtered = data.filter((row) =>
    columns.some((col) =>
      String(row[col.key] ?? "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  // Sorted rows
  $: sorted = [...filtered].sort((a, b) => {
    if (!sortColumn) return 0;
    const valA = a[sortColumn];
    const valB = b[sortColumn];
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  $: totalPages = Math.ceil(sorted.length / rowsPerPage);
  $: paginated = sorted.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  function sortBy(key) {
    if (sortColumn === key) {
      sortAsc = !sortAsc;
    } else {
      sortColumn = key;
      sortAsc = true;
    }
  }

  function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
      dispatch("pageChange", page);
    }
  }

  let debounceTimeout;
  function handleSearchChange(value) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      dispatch("search", value);
    }, 300);
  }

  function handleRowsPerPageChange(value) {
    dispatch("rowsPerPageChange", +value);
  }
</script>

<!-- Header Controls -->
<div
  class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3"
>
  <div class="d-flex align-items-center gap-2 flex-wrap">
    <div class="dropdown">
      <a
        href="#dropdown"
        class="dropdown-toggle btn btn-outline-light px-2 shadow"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i class="ti ti-sort-ascending-2 me-2"></i>Sort By
      </a>
      <div class="dropdown-menu">
        <ul class="list-unstyled m-0 p-2">
          <li>
            <a
              href="#Newest"
              class="dropdown-item"
              on:click={() => {
                sortBy("created_at");
                sortAsc = false;
              }}
            >
              Newest
            </a>
          </li>
          <li>
            <a
              href="#Oldest"
              class="dropdown-item"
              on:click={() => {
                sortBy("created_at");
                sortAsc = true;
              }}
            >
              Oldest
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div class="d-flex align-items-center gap-2 flex-wrap">
    <input
      type="text"
      value={search}
      on:input={(e) => handleSearchChange(e.target.value)}
      placeholder="Search..."
      class="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
    />
  </div>
</div>

<!-- Table -->
<div class="overflow-x-auto">
  <table
    class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm"
  >
    <thead>
      <tr class="bg-gray-100 text-left text-gray-700 uppercase text-sm">
        <th class="px-4 py-2 cursor-pointer whitespace-nowrap">S.N.</th>
        {#each columns as col}
          <th
            class="px-4 py-2 cursor-pointer whitespace-nowrap"
            on:click={() => sortBy(col.key)}
          >
            {col.label}
            {#if sortColumn === col.key}
              {sortAsc ? " ▲" : " ▼"}
            {/if}
          </th>
        {/each}
        {#if actions.length > 0}
          <th class="px-4 py-2 cursor-pointer whitespace-nowrap">Actions </th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#if paginated.length > 0}
        {#each paginated as row, i (row.id ?? i)}
          <tr class="border-t hover:bg-gray-50">
            <td class="px-4 py-2 whitespace-nowrap"> {i + 1}.</td>
            {#each columns as col}
              <td class="px-4 py-2 whitespace-nowrap">
                {#if col.render}
                  {@html col.render(row[col.key], row)}
                {:else}
                  {row[col.key] ?? "-"}
                {/if}
              </td>
            {/each}
            {#if actions.length > 0}
              <td class="px-4 py-2 whitespace-nowrap">
                <div class="d-inline-flex gap-2">
                  {#each actions as action}
                    <button
                      on:click={() => action.onClick(row.id)}
                      class={`btn btn-icon btn-sm rounded-pill ${action.color}`}
                    >
                      <i class={`${action.icon}`}></i>
                    </button>
                  {/each}
                </div>
              </td>
            {/if}
          </tr>
        {/each}
      {:else}
        <tr>
          <td
            colspan={columns.length + 1 + (actions.length > 0 ? 1 : 0)}
            class="px-4 py-2 text-center text-gray-500"
          >
            No matching results
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>

<!-- Pagination & Rows Per Page -->
<div class="row align-items-center mt-4">
  <div class="col-md-6">
    <div class="dataTables_length">
      <label>
        Rows Per Page:
        <select
          class="form-select form-select-sm"
          bind:value={rowsPerPage}
          on:change={(e) => handleRowsPerPageChange(e.target.value)}
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </label>
    </div>
  </div>

  <div class="col-md-6">
    <div class="dataTables_paginate paging_simple_numbers">
      <ul class="pagination justify-content-end">
        <li class="page-item {currentPage === 1 ? 'disabled' : ''}">
          <a
            class="page-link"
            href="#pagePreious"
            aria-disabled={currentPage === 1}
            on:click|preventDefault={() => goToPage(currentPage - 1)}
          >
            <i class="ti ti-arrow-left"></i>
          </a>
        </li>

        {#each Array(totalPages) as _, i}
          <li class="page-item {i + 1 === currentPage ? 'active' : ''}">
            <a
              href="#page"
              class="page-link"
              aria-current={i + 1 === currentPage ? "page" : undefined}
              on:click|preventDefault={() => goToPage(i + 1)}
            >
              {i + 1}
            </a>
          </li>
        {/each}

        <li class="page-item {currentPage === totalPages ? 'disabled' : ''}">
          <a
            class="page-link"
            href="#pageNext"
            aria-disabled={currentPage === totalPages}
            on:click|preventDefault={() => goToPage(currentPage + 1)}
          >
            <i class="ti ti-arrow-right"></i>
          </a>
        </li>
      </ul>
    </div>
  </div>
</div>
