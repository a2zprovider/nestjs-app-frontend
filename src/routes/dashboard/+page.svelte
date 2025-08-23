<script>
  import "../../styles/main.css";
  import { clearUser, setUser } from "../../stores/userStore";
  import { onMount } from "svelte";
  import { checkAuth, logoutUser } from "$lib/utils/auth";
  import { goto } from "$app/navigation";
  import Header from "$lib/components/Header.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";

  let currentUser;
  onMount(() => {
    currentUser = checkAuth();
    if (!currentUser) {
      goto("/login");
    } else {
      setUser(currentUser);
    }
  });
</script>

<Header />
<Sidebar />

<div class="page-wrapper">
  <!-- Start Content -->
  <div class="content pb-0">
    <!-- Page Header -->
    <div class="flex items-center justify-between gap-2 mb-4 flex-wrap">
      <div>
        <h4 class="mb-0">Deals Dashboard</h4>
      </div>
    </div>
    <!-- End Page Header -->
    <div class="row row-gap-3 mb-4">
      <!-- Total Companies -->
      <div class="col-xl-3 col-sm-6 flex">
        <div class="card flex-fill mb-0 relative overflow-hidden">
          <div class="card-body relative z-1">
            <div class="flex items-start justify-between">
              <div class="flex items-start justify-between">
                <div>
                  <p class="fs-14 mb-1">Total Companies</p>
                  <h2 class="mb-1 fs-16">5468</h2>
                  <p class="text-success mb-0 fs-13">
                    <i class="ti ti-arrow-bar-up me-1"></i>5.62%<span
                      class="text-body ms-1">from last month</span
                    >
                  </p>
                </div>
              </div>
              <div class="flex align-items-center justify-between">
                <span
                  class="avatar avatar-md rounded-circle bg-soft-primary border border-primary"
                >
                  <i class="ti ti-building fs-16 text-primary"></i>
                </span>
              </div>
            </div>
          </div>
          <img
            src="assets/img/icons/elemnt-01.svg"
            alt="elemnt-04"
            class="img-fluid position-absolute top-0 Start-0"
          />
        </div>
      </div>
      <!-- /Total Companies -->

      <!-- Total Companies -->
      <div class="col-xl-3 col-sm-6 flex">
        <div class="card flex-fill mb-0 relative overflow-hidden">
          <div class="card-body relative z-1">
            <div class="flex items-start justify-between">
              <div class="flex items-start justify-between">
                <div>
                  <p class="fs-14 mb-1">Active Companies</p>
                  <h2 class="mb-1 fs-16">4598</h2>
                  <p class="text-danger mb-0 fs-13">
                    <i class="ti ti-arrow-bar-down me-1"></i>12%<span
                      class="text-body ms-1">from last month</span
                    >
                  </p>
                </div>
              </div>
              <div class="flex align-items-center justify-between">
                <span
                  class="avatar avatar-md rounded-circle bg-soft-success border border-success"
                >
                  <i class="ti ti-carousel-vertical fs-16 text-success"></i>
                </span>
              </div>
            </div>
          </div>
          <img
            src="assets/img/icons/elemnt-02.svg"
            alt="elemnt-04"
            class="img-fluid position-absolute top-0 Start-0"
          />
        </div>
      </div>
      <!-- /Total Companies -->

      <!-- Total Companies -->
      <div class="col-xl-3 col-sm-6 flex">
        <div class="card flex-fill mb-0 relative overflow-hidden">
          <div class="card-body relative z-1">
            <div class="flex items-start justify-between">
              <div class="flex items-start justify-between">
                <div>
                  <p class="fs-14 mb-1">Total Subscribers</p>
                  <h2 class="mb-1 fs-16">5468</h2>
                  <p class="text-success mb-0 fs-13">
                    <i class="ti ti-arrow-bar-up me-1"></i>6%<span
                      class="text-body ms-1">from last month</span
                    >
                  </p>
                </div>
              </div>
              <div class="flex align-items-center justify-between">
                <span
                  class="avatar avatar-md rounded-circle bg-soft-warning border border-warning"
                >
                  <i class="ti ti-chalkboard-off fs-16 text-warning"></i>
                </span>
              </div>
            </div>
          </div>
          <img
            src="assets/img/icons/elemnt-03.svg"
            alt="elemnt-04"
            class="img-fluid position-absolute top-0 Start-0"
          />
        </div>
      </div>
      <!-- /Total Companies -->

      <!-- Total Companies -->
      <div class="col-xl-3 col-sm-6 flex">
        <div class="card flex-fill mb-0 relative overflow-hidden">
          <div class="card-body relative z-1">
            <div class="flex items-start justify-between">
              <div class="flex items-start justify-between">
                <div>
                  <p class="fs-14 mb-1">Total Earnings</p>
                  <h2 class="mb-1 fs-16">$89,878,58</h2>
                  <p class="text-danger mb-0 fs-13">
                    <i class="ti ti-arrow-bar-down me-1"></i>16%<span
                      class="text-body ms-1">from last month</span
                    >
                  </p>
                </div>
              </div>
              <div class="flex align-items-center justify-between">
                <span
                  class="avatar avatar-md rounded-circle bg-soft-danger border border-danger mb-3"
                >
                  <i class="ti ti-businessplan fs-16 text-primary"></i>
                </span>
              </div>
            </div>
          </div>
          <img
            src="assets/img/icons/elemnt-04.svg"
            alt="elemnt-04"
            class="img-fluid position-absolute top-0 Start-0"
          />
        </div>
      </div>
      <!-- /Total Companies -->
    </div>

    <!-- start row -->
    <div class="row">
      <div class="col-md-6 flex">
        <div class="card flex-fill">
          <div
            class="card-header flex items-center justify-between flex-wrap row-gap-3"
          >
            <h6 class="mb-0">Recently Created Deals</h6>
            <div class="dropdown">
              <a
                class="dropdown-toggle btn btn-outline-light shadow"
                data-bs-toggle="dropdown"
                href="#"
              >
                Last 30 days
              </a>
              <div class="dropdown-menu dropdown-menu-end">
                <a href="#" class="dropdown-item"> Last 15 days </a>
                <a href="#" class="dropdown-item"> Last 30 days </a>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="table-responsive custom-table">
              <div
                id="deals-project_wrapper"
                class="dataTables_wrapper dt-bootstrap5 no-footer"
              >
                <div class="row">
                  <div class="col-sm-12 col-md-6"></div>
                  <div class="col-sm-12 col-md-6"></div>
                </div>
                <div class="row dt-row">
                  <div class="col-sm-12">
                    <table
                      class="table dataTable table-nowrap no-footer"
                      id="deals-project"
                      style="width: 762px;"
                    >
                      <thead class="table-light">
                        <tr
                          ><th
                            class="sorting_disabled"
                            rowspan="1"
                            colspan="1"
                            style="width: 293px;">Deal Name</th
                          ><th
                            class="sorting_disabled"
                            rowspan="1"
                            colspan="1"
                            style="width: 156px;">Stage</th
                          ><th
                            class="sorting_disabled"
                            rowspan="1"
                            colspan="1"
                            style="width: 123px;">Deal Value</th
                          ><th
                            class="sorting_disabled"
                            rowspan="1"
                            colspan="1"
                            style="width: 80px;">Status</th
                          ></tr
                        >
                      </thead>
                      <tbody>
                        <tr class="odd"
                          ><td
                            ><a href="deals-details.html" class="fw-medium"
                              >SkyHigh Annual Booking</a
                            ></td
                          ><td>Appointment</td><td>$04,51,000</td><td
                            ><span class="badge badge-pill bg-success">Won</span
                            ></td
                          ></tr
                        ><tr class="even"
                          ><td
                            ><a href="deals-details.html" class="fw-medium"
                              >CRM Onboarding Package</a
                            ></td
                          ><td>Contact Made</td><td>$72,14,078</td><td
                            ><span class="badge badge-pill bg-danger">Lost</span
                            ></td
                          ></tr
                        ><tr class="odd"
                          ><td
                            ><a href="deals-details.html" class="fw-medium"
                              >Enterprise Plan Upgrade</a
                            ></td
                          ><td>Presentation</td><td>$04,14,800</td><td
                            ><span class="badge badge-pill bg-success">Won</span
                            ></td
                          ></tr
                        ><tr class="even"
                          ><td
                            ><a href="deals-details.html" class="fw-medium"
                              >CRM Migration Project</a
                            ></td
                          ><td>Proposal Made</td><td>$16,11,400</td><td
                            ><span class="badge badge-pill bg-success">Won</span
                            ></td
                          ></tr
                        ><tr class="odd"
                          ><td
                            ><a href="deals-details.html" class="fw-medium"
                              >Sales Pipeline Optimization</a
                            ></td
                          ><td>Qualify To Buy</td><td>$09,05,947</td><td
                            ><span class="badge badge-pill bg-success">Won</span
                            ></td
                          ></tr
                        ></tbody
                      >
                    </table>
                  </div>
                </div>
                <div class="row">
                  <div class="col-sm-12 col-md-5"></div>
                  <div class="col-sm-12 col-md-7"></div>
                </div>
              </div>
            </div>
          </div>
          <!-- end card body -->
        </div>
        <!-- end card -->
      </div>
      <!-- end col -->
    </div>
    <!-- end row -->
  </div>
  <!-- End Content -->

  <!-- Start Footer -->
  <footer class="footer flex justify-between text-md-start text-center">
    <p class="mb-md-0 mb-1">
      Copyright © 2025
      <a href="#" class="link-primary text-decoration-underline">CRMS</a>
    </p>
    <div
      class="flex items-center gap-2 footer-links justify-content-center justify-content-md-end"
    >
      <a href="#">About</a>
      <a href="#">Terms</a>
      <a href="#">Contact Us</a>
    </div>
  </footer>
  <!-- End Footer -->
</div>
