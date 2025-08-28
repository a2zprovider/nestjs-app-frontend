<script>
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  let NewLead;
  let Contacted;
  let FollowUp;
  let Qualified;
  let Unqualified;
  let NeedsAssessment;
  let QuotationSent;
  let NegotiationInProgress;
  let DealWon;
  let DealLost;

  export let orders;
  export let accordingToStatusOrders;
  export let updateOrderStatus;
  console.log("accordingToStatusOrders : ", accordingToStatusOrders);

  // onMount(async () => {
  //   NewLead = accordingToStatusOrders.NewLead;
  //   Contacted = accordingToStatusOrders.Contacted;
  // });

  onMount(async () => {
    if (typeof window !== "undefined") {
      // Shim `global` in the browser environment
      globalThis.global = globalThis;

      const dragula = (await import("dragula")).default;

      const drake = dragula(
        [
          NewLead,
          Contacted,
          FollowUp,
          Qualified,
          Unqualified,
          NeedsAssessment,
          QuotationSent,
          NegotiationInProgress,
          DealWon,
          DealLost,
        ],
        {
          removeOnSpill: false,
          revertOnSpill: false,
          accepts: (el, target, source, sibling) => {
            return true;
          },
        }
      );

      // Optionally: Customize Dragula options
      drake.on("drag", (el) => {
        console.log("dragging", el);
      });

      drake.on("drop", async (el, target) => {
        console.log("dropped", el);
        const newStatus = target.getAttribute("data-status");

        if (newStatus) {
          const orderId = el.dataset.orderId;
          if (!orderId) {
            console.warn("Dropped item has no order ID");
            return;
          }
          console.log("newStatus: ", newStatus);
          console.log("orderId: ", orderId);

          if (orderId && newStatus) {
            updateOrderStatus(orderId, newStatus);
          }
        }
      });

      return () => {
        drake.destroy(); // Cleanup when the component is destroyed
      };
    }
  });

  function getAvatarText(title) {
    if (!title) return "";
    const words = title.trim().split(" ");
    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  }
</script>

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
            <span
              >{accordingToStatusOrders?.NewLead?.length} Orders - ₹ 1,00,000.00</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="kanban-drag-wrap" bind:this={NewLead} data-status="New Lead">
      {#if accordingToStatusOrders?.NewLead?.length}
        {#each accordingToStatusOrders?.NewLead as order}
          {#if order.status === "New Lead"}
            <div data-order-id={order?.id}>
              <div class="card kanban-card border mb-0 mt-3 shadow">
                <div class="card-body">
                  <div class="d-block">
                    <div class="flex items-center mb-3">
                      <a
                        href={`/admin/order/${order?.id}`}
                        class="avatar bg-soft-success text-success rounded-circle flex-shrink-0 me-2"
                      >
                        <span class="avatar-title text-success"
                          >{getAvatarText(order?.title)}</span
                        >
                      </a>
                      <h6 class="fw-medium fs-14 mb-0">
                        <a href={`/admin/order/${order?.id}`} class="capitalize"
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
                        new Date(order.orderDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
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
                      <a href="#label" class="flex items-center justify-center">
                        <i class="ti ti-color-swatch"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        {/each}
      {/if}
    </div>
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
    <div class="kanban-drag-wrap" bind:this={Contacted} data-status="Contacted">
      {#if accordingToStatusOrders?.Contacted.length}
        {#each accordingToStatusOrders?.Contacted as order}
          {#if order.status === "Contacted"}
            <div data-order-id={order?.id}>
              <div class="card kanban-card border mb-0 mt-3 shadow">
                <div class="card-body">
                  <div class="d-block">
                    <div class="flex items-center mb-3">
                      <a
                        href={`/admin/order/${order?.id}`}
                        class="avatar bg-soft-success text-success rounded-circle flex-shrink-0 me-2"
                      >
                        <span class="avatar-title text-success"
                          >{getAvatarText(order?.title)}</span
                        >
                      </a>
                      <h6 class="fw-medium fs-14 mb-0">
                        <a href={`/admin/order/${order?.id}`} class="capitalize"
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
                        new Date(order.orderDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
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
                      <a href="#label" class="flex items-center justify-center">
                        <i class="ti ti-color-swatch"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        {/each}
      {/if}
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
    <div class="kanban-drag-wrap" bind:this={FollowUp} data-status="Follow Up">
      {#if accordingToStatusOrders?.FollowUp.length}
        {#each accordingToStatusOrders?.FollowUp as order}
          <div data-order-id={order?.id}>
            <div class="card kanban-card border mb-0 mt-3 shadow">
              <div class="card-body">
                <div class="d-block">
                  <div class="flex items-center mb-3">
                    <a
                      href={`/admin/order/${order?.id}`}
                      class="avatar bg-soft-success text-success rounded-circle flex-shrink-0 me-2"
                    >
                      <span class="avatar-title text-success"
                        >{getAvatarText(order?.title)}</span
                      >
                    </a>
                    <h6 class="fw-medium fs-14 mb-0">
                      <a href={`/admin/order/${order?.id}`} class="capitalize"
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
                    <a href="#user" class="avatar avatar-xs flex-shrink-0 me-2">
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
                      new Date(order.orderDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
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
                    <a href="#label" class="flex items-center justify-center">
                      <i class="ti ti-color-swatch"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
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
    <div class="kanban-drag-wrap" bind:this={Qualified} data-status="Qualified">
      {#if accordingToStatusOrders?.Qualified.length}
        {#each accordingToStatusOrders?.Qualified as order}
          <div data-order-id={order?.id}>
            <div class="card kanban-card border mb-0 mt-3 shadow">
              <div class="card-body">
                <div class="d-block">
                  <div class="flex items-center mb-3">
                    <a
                      href={`/admin/order/${order?.id}`}
                      class="avatar bg-soft-success text-success rounded-circle flex-shrink-0 me-2"
                    >
                      <span class="avatar-title text-success"
                        >{getAvatarText(order?.title)}</span
                      >
                    </a>
                    <h6 class="fw-medium fs-14 mb-0">
                      <a href={`/admin/order/${order?.id}`} class="capitalize"
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
                    <a href="#user" class="avatar avatar-xs flex-shrink-0 me-2">
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
                      new Date(order.orderDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
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
                    <a href="#label" class="flex items-center justify-center">
                      <i class="ti ti-color-swatch"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
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
    <div
      class="kanban-drag-wrap"
      bind:this={Unqualified}
      data-status="Unqualified"
    >
      {#if accordingToStatusOrders?.Unqualified.length}
        {#each accordingToStatusOrders?.Unqualified as order}
          <div data-order-id={order?.id}>
            <div class="card kanban-card border mb-0 mt-3 shadow">
              <div class="card-body">
                <div class="d-block">
                  <div class="flex items-center mb-3">
                    <a
                      href={`/admin/order/${order?.id}`}
                      class="avatar bg-soft-success text-success rounded-circle flex-shrink-0 me-2"
                    >
                      <span class="avatar-title text-success"
                        >{getAvatarText(order?.title)}</span
                      >
                    </a>
                    <h6 class="fw-medium fs-14 mb-0">
                      <a href={`/admin/order/${order?.id}`} class="capitalize"
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
                    <a href="#user" class="avatar avatar-xs flex-shrink-0 me-2">
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
                      new Date(order.orderDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
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
                    <a href="#label" class="flex items-center justify-center">
                      <i class="ti ti-color-swatch"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
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
    <div
      class="kanban-drag-wrap"
      bind:this={NeedsAssessment}
      data-status="Needs Assessment"
    >
      {#if accordingToStatusOrders?.NeedsAssessment.length}
        {#each accordingToStatusOrders?.NeedsAssessment as order}
          <div data-order-id={order?.id}>
            <div class="card kanban-card border mb-0 mt-3 shadow">
              <div class="card-body">
                <div class="d-block">
                  <div class="flex items-center mb-3">
                    <a
                      href={`/admin/order/${order?.id}`}
                      class="avatar bg-soft-success text-success rounded-circle flex-shrink-0 me-2"
                    >
                      <span class="avatar-title text-success"
                        >{getAvatarText(order?.title)}</span
                      >
                    </a>
                    <h6 class="fw-medium fs-14 mb-0">
                      <a href={`/admin/order/${order?.id}`} class="capitalize"
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
                    <a href="#user" class="avatar avatar-xs flex-shrink-0 me-2">
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
                      new Date(order.orderDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
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
                    <a href="#label" class="flex items-center justify-center">
                      <i class="ti ti-color-swatch"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
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
    <div
      class="kanban-drag-wrap"
      bind:this={QuotationSent}
      data-status="Quotation Sent"
    >
      {#if accordingToStatusOrders?.QuotationSent.length}
        {#each accordingToStatusOrders?.QuotationSent as order}
          <div data-order-id={order?.id}>
            <div class="card kanban-card border mb-0 mt-3 shadow">
              <div class="card-body">
                <div class="d-block">
                  <div class="flex items-center mb-3">
                    <a
                      href={`/admin/order/${order?.id}`}
                      class="avatar bg-soft-success text-success rounded-circle flex-shrink-0 me-2"
                    >
                      <span class="avatar-title text-success"
                        >{getAvatarText(order?.title)}</span
                      >
                    </a>
                    <h6 class="fw-medium fs-14 mb-0">
                      <a href={`/admin/order/${order?.id}`} class="capitalize"
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
                    <a href="#user" class="avatar avatar-xs flex-shrink-0 me-2">
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
                      new Date(order.orderDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
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
                    <a href="#label" class="flex items-center justify-center">
                      <i class="ti ti-color-swatch"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
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
    <div
      class="kanban-drag-wrap"
      bind:this={NegotiationInProgress}
      data-status="Negotiation In Progress"
    >
      {#if accordingToStatusOrders?.NegotiationInProgress.length}
        {#each accordingToStatusOrders?.NegotiationInProgress as order}
          <div data-order-id={order?.id}>
            <div class="card kanban-card border mb-0 mt-3 shadow">
              <div class="card-body">
                <div class="d-block">
                  <div class="flex items-center mb-3">
                    <a
                      href={`/admin/order/${order?.id}`}
                      class="avatar bg-soft-success text-success rounded-circle flex-shrink-0 me-2"
                    >
                      <span class="avatar-title text-success"
                        >{getAvatarText(order?.title)}</span
                      >
                    </a>
                    <h6 class="fw-medium fs-14 mb-0">
                      <a href={`/admin/order/${order?.id}`} class="capitalize"
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
                    <a href="#user" class="avatar avatar-xs flex-shrink-0 me-2">
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
                      new Date(order.orderDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
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
                    <a href="#label" class="flex items-center justify-center">
                      <i class="ti ti-color-swatch"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
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
    <div class="kanban-drag-wrap" bind:this={DealWon} data-status="Deal Won">
      {#if accordingToStatusOrders?.DealWon.length}
        {#each accordingToStatusOrders?.DealWon as order}
          <div data-order-id={order?.id}>
            <div class="card kanban-card border mb-0 mt-3 shadow">
              <div class="card-body">
                <div class="d-block">
                  <div class="flex items-center mb-3">
                    <a
                      href={`/admin/order/${order?.id}`}
                      class="avatar bg-soft-success text-success rounded-circle flex-shrink-0 me-2"
                    >
                      <span class="avatar-title text-success"
                        >{getAvatarText(order?.title)}</span
                      >
                    </a>
                    <h6 class="fw-medium fs-14 mb-0">
                      <a href={`/admin/order/${order?.id}`} class="capitalize"
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
                    <a href="#user" class="avatar avatar-xs flex-shrink-0 me-2">
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
                      new Date(order.orderDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
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
                    <a href="#label" class="flex items-center justify-center">
                      <i class="ti ti-color-swatch"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
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
    <div class="kanban-drag-wrap" bind:this={DealLost} data-status="Deal Lost">
      {#if accordingToStatusOrders?.DealLost.length}
        {#each accordingToStatusOrders?.DealLost as order}
          <div data-order-id={order?.id}>
            <div class="card kanban-card border mb-0 mt-3 shadow">
              <div class="card-body">
                <div class="d-block">
                  <div class="flex items-center mb-3">
                    <a
                      href={`/admin/order/${order?.id}`}
                      class="avatar bg-soft-success text-success rounded-circle flex-shrink-0 me-2"
                    >
                      <span class="avatar-title text-success"
                        >{getAvatarText(order?.title)}</span
                      >
                    </a>
                    <h6 class="fw-medium fs-14 mb-0">
                      <a href={`/admin/order/${order?.id}`} class="capitalize"
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
                    <a href="#user" class="avatar avatar-xs flex-shrink-0 me-2">
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
                      new Date(order.orderDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
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
                    <a href="#label" class="flex items-center justify-center">
                      <i class="ti ti-color-swatch"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
<!-- /Orders Kanban -->
