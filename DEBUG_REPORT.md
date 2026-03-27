# EcoBazaarX Debugging Report

## 1. Project Overview

EcoBazaarX is a full-stack marketplace project using:

- React frontend in `Frontend/`
- Spring Boot backend in `Backend/SignupForm/SignupForm/`
- MySQL database configured through `application.properties`

The project compiled successfully, but several runtime and workflow mismatches were preventing it from behaving like a fully usable app.

## 2. Issues Identified

### Issue A: Admin flow was not reliable on a fresh setup

- The UI had admin-only pages and product moderation flows.
- The backend signup flow always forced new users to `USER`.
- On a fresh database, there was no guaranteed admin account available.

### Issue B: Product visibility did not match moderation workflow

- Products default to `Hold` in the backend entity.
- The catalog page filtered products to `Approved` only.
- That made newly created or held products appear to be “missing” to the user-facing app.

### Issue C: CORS configuration was split across multiple places

- Global CORS was already configured in `SecurityConfig`.
- `AuthController` and `AddressController` also had controller-specific `@CrossOrigin` annotations.
- This made auth and address flows more fragile across local ports and could cause origin-specific failures.

### Issue D: Signup UI messaging was misleading

- Signup copy said users could choose a role.
- The backend did not honor public admin signup.
- This created a mismatch between what the UI implied and what the backend actually allowed.

### Issue E: Cart and wishlist requests were fragile in local development

- The browser showed `Failed to fetch` and `ERR_NETWORK` for `/api/cart` and `/api/wishlist`.
- The backend was reachable, but local browser requests can originate from different dev ports.
- The frontend also depended on `.env` to know the backend URL, so a missing env file could silently point requests at the frontend origin instead.

## 3. Root Cause Analysis

### Expected Behavior

- The app should be usable on a fresh local setup.
- Admin-only workflows should be reachable when needed.
- Users should be able to authenticate, browse products, manage addresses, and place orders.
- Local React development ports should work without controller-specific CORS surprises.

### Actual Behavior

- Fresh setups could lack any admin account.
- Product moderation state and catalog filtering made some products look unavailable.
- Address/auth calls depended on controller-level origin annotations instead of one centralized rule.
- Signup suggested role selection that the backend did not actually support.
- Cart and wishlist could fail in the browser with `status: 0` even while the backend itself was healthy.

### Possible Root Causes Considered

1. Build failures or syntax errors
2. API route mismatch between frontend services and backend controllers
3. Missing admin bootstrap path
4. Over-filtered product visibility
5. CORS misconfiguration on auth/address endpoints
6. Narrow local-origin allowlist for browser API requests
7. Frontend fallback API base URL pointing at the wrong origin
8. Database connectivity failure

### Most Likely Causes

The biggest functional blockers were not compile-time errors. They were workflow-level issues:

- no guaranteed admin on a fresh database
- hidden products caused by moderation-state filtering
- fragmented CORS rules
- misleading signup UX
- overly strict local CORS defaults combined with a fragile frontend API fallback

## 4. Fixes Applied

### Fix 1: Added bootstrap admin creation

Created:

- `Backend/SignupForm/SignupForm/src/main/java/com/SignupForm/config/AdminBootstrapRunner.java`

Configured:

- `Backend/SignupForm/SignupForm/src/main/resources/application.properties`

Behavior:

- On startup, if the configured admin email does not exist, the app creates a default `ADMIN` user.

### Fix 2: Centralized CORS handling

Updated:

- `Backend/SignupForm/SignupForm/src/main/java/com/SignupForm/controller/AuthController.java`
- `Backend/SignupForm/SignupForm/src/main/java/com/SignupForm/controller/AddressController.java`

Behavior:

- Removed controller-specific `@CrossOrigin` annotations so the shared `SecurityConfig` CORS setup is the single source of truth.

### Fix 3: Made admin catalog visibility match moderation flow

Updated:

- `Frontend/src/pages/ProductCatalog.jsx`

Behavior:

- Normal users still see only `Approved` products.
- Admin users can now see all products, including `Hold`, so moderation and review workflows are usable.

### Fix 4: Aligned signup UX with backend behavior

Updated:

- `Frontend/src/pages/Signup.jsx`

Behavior:

- Removed role-selection validation and misleading copy.
- Signup now clearly behaves like a standard shopper account creation flow.

### Fix 5: Made local API connectivity more reliable

Updated:

- `Backend/SignupForm/SignupForm/src/main/resources/application.properties`
- `Frontend/src/config/api.js`

Behavior:

- Backend CORS now accepts localhost, `127.0.0.1`, and loopback development origins on any local port instead of only a short hardcoded list.
- Frontend development mode now falls back to `http://localhost:8080` when `REACT_APP_API_BASE_URL` is missing, which prevents accidental requests to the frontend origin.

## 5. Before vs After Code Diffs

### A. Admin bootstrap

```diff
+@Component
+public class AdminBootstrapRunner implements CommandLineRunner {
+    // create default ADMIN on startup if missing
+}
```

### B. Product visibility

```diff
-const approvedOnly = data.filter(p => p.status === "Approved");
-setProducts(approvedOnly);
+setProducts(Array.isArray(data) ? data : []);

-result = result.filter((p) => p.status === "Approved");
+if (user?.role !== "ADMIN") {
+  result = result.filter((p) => p.status === "Approved");
+}
```

### C. CORS cleanup

```diff
-@CrossOrigin(origins = "http://localhost:3000")
 @RestController
```

```diff
-@CrossOrigin(origins = "http://localhost:5173")
 public class AddressController {
```

### D. Signup UX

```diff
-const { name, email, phone, password, confirmPassword, role } = formData;
+const { name, email, phone, password, confirmPassword } = formData;

-if (!name || !email || !phone || !password || !role) {
+if (!name || !email || !phone || !password) {
```

```diff
-<p className="auth-sub">Create your account and choose your role.</p>
+<p className="auth-sub">Create your account to start shopping.</p>
```

### E. Local API connectivity

```diff
-app.cors.allowed-origins=${APP_CORS_ALLOWED_ORIGINS:http://localhost:3000,http://localhost:3001,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:5173}
+app.cors.allowed-origins=${APP_CORS_ALLOWED_ORIGINS:http://localhost:*,http://127.0.0.1:*,http://[::1]:*,https://localhost:*,https://127.0.0.1:*}
```

```diff
-export const API_BASE_URL = "http://localhost:8080";
+const DEFAULT_BACKEND_URL = "http://localhost:8080";
+
+const fallbackBaseUrl =
+  process.env.NODE_ENV === "development"
+    ? DEFAULT_BACKEND_URL
+    : typeof window !== "undefined"
+      ? window.location.origin
+      : DEFAULT_BACKEND_URL;
+
+export const API_BASE_URL =
+  process.env.REACT_APP_API_BASE_URL?.trim() || fallbackBaseUrl;
```

## 6. Behavioral Changes

- Fresh local runs now get a working default admin account if one does not already exist.
- Admins can see held products in the catalog and manage approval workflows more naturally.
- Auth and address requests are less likely to fail because of conflicting CORS definitions.
- Signup behavior is now consistent with the backend’s real permissions model.
- Cart and wishlist requests are more likely to succeed across changing local frontend ports.
- Missing frontend env configuration no longer silently redirects API calls to the frontend origin in development.

## 7. Testing Steps

### Verified

1. Frontend production build:
   `npm run build`
2. Backend test suite / application context:
   `mvn test`

### Result

- Frontend build: passed
- Backend tests: passed

### Additional Manual Checks Recommended

1. Start backend and frontend locally.
2. Log in with the bootstrap admin:
   - Email: `admin@ecobazar.local`
   - Password: `Admin@123`
3. Open admin pages and confirm product moderation is reachable.
4. Create a normal user through signup.
5. Confirm the frontend origin can call `http://localhost:8080/api/products`.
6. Add products to cart, go to checkout, save an address, and place an order.
7. Verify wishlist load/add/remove works after login.

## 8. Edge Cases

- If the configured bootstrap admin already exists, the runner safely does nothing.
- Normal users still cannot see held products.
- If address APIs were previously accessed from a different local port, they now rely on centralized CORS rules only.
- Existing local database data is preserved.
- If a developer runs the frontend on a new localhost port, backend CORS should still accept it.
- Production deployments should still set an explicit `REACT_APP_API_BASE_URL` and `APP_CORS_ALLOWED_ORIGINS` instead of relying on local defaults.

## 9. Developer Notes

- The backend currently contains hard-coded local secrets/config values in `application.properties`. That is acceptable for local debugging, but it should be moved to environment variables before production use.
- The bootstrap admin credentials are useful for local setup only and should be changed or disabled for any shared environment.
- The broadened CORS defaults are intentionally development-friendly. For production, tighten `APP_CORS_ALLOWED_ORIGINS` to the real deployed frontend origins.
- Frontend `npm test -- --watchAll=false` could not be completed in this environment because Node hit a filesystem permission error while resolving `C:\Users\HP`. This looked environment-related rather than code-related.

## 10. Final Summary

The main blockers were workflow and configuration mismatches, not compilation failures. The project now:

- builds cleanly on frontend
- passes backend tests
- has a working default admin bootstrap path
- has improved admin/product moderation usability
- uses centralized CORS behavior for auth/address flows
- has signup UX aligned with actual backend permissions
- is more resilient to local cart/wishlist failures caused by frontend origin and API base URL mismatches

## 11. Phase 1 SaaS Foundation Update

### What changed

- Added a clearer route model for `/user/*`, `/seller/*`, and `/admin/*`
- Replaced the old admin-only route guard with a reusable role-aware `ProtectedRoute`
- Centralized role path generation in `Frontend/src/utils/roleAccess.js`
- Updated navbar and footer links to use role-based SaaS paths
- Removed public admin signup from the normal signup UI
- Added backward-compatible redirects so old paths like `/products`, `/cart`, and `/my-orders` still resolve

### Key examples

```diff
-/products
-/cart
-/add-product
+/user/catalog
+/user/cart
+/seller/products/new
+/admin/management
```

```diff
-<option value="ADMIN">Admin Account</option>
+Admin access is managed separately by the platform.
```

### Phase 1 result

The app still reuses some shared screens, but the platform foundation now behaves much more like a SaaS system:

- `USER` flows are shopping-focused
- `SELLER` flows are storefront-focused
- `ADMIN` flows are governance-focused

This creates the base needed for the next SaaS phases:

1. seller profile/store entity
2. seller-owned product management
3. seller order workspace
4. deeper admin governance and reporting

## 12. Phase 2 Seller Domain Update

### What changed

- Added a real `seller_profiles` domain model on the backend
- Seller signup now automatically provisions a seller profile
- Added seller profile APIs for fetch/update
- Product ownership now records `sellerProfileId` and uses the seller profile store name as the source of truth
- Seller dashboard now loads and updates store profile data from the backend

### Backend additions

- `Backend/SignupForm/SignupForm/src/main/java/com/SignupForm/entity/SellerProfile.java`
- `Backend/SignupForm/SignupForm/src/main/java/com/SignupForm/repository/SellerProfileRepository.java`
- `Backend/SignupForm/SignupForm/src/main/java/com/SignupForm/service/SellerProfileService.java`
- `Backend/SignupForm/SignupForm/src/main/java/com/SignupForm/dto/seller/SellerProfileResponse.java`
- `Backend/SignupForm/SignupForm/src/main/java/com/SignupForm/dto/seller/UpdateSellerProfileRequest.java`

### API additions

- `GET /api/seller/profile`
- `PUT /api/seller/profile`

### Behavior changes

- A seller account now has a first-class store profile instead of relying only on product-level seller text.
- Seller-created products now inherit the store name from the seller profile.
- Seller dashboard editing updates persistent store metadata, not just local UI state.
- Auth responses now include `storeName` for seller accounts.

### Validation

- `npm run build`: passed
- `mvn test`: passed

### Remaining gap after Phase 2

Seller identity is now first-class, but order ownership is still derived through order items rather than a dedicated seller-order aggregate. The next phase should focus on:

1. richer seller product management screens
2. stronger seller order lifecycle controls
3. admin approval/compliance states for seller profiles

## 13. Phase 3 Seller Console Split

### What changed

- Split the seller workspace into dedicated screens instead of keeping everything inside one page
- Added seller routes for overview, products, orders, and store profile
- Updated seller navigation so these screens are reachable from the shared app shell
- Kept `SellerDashboard` as the overview page and moved deeper management into focused screens

### New frontend screens

- `Frontend/src/pages/SellerProducts.jsx`
- `Frontend/src/pages/SellerOrders.jsx`
- `Frontend/src/pages/SellerProfile.jsx`

### Route additions

- `/seller/dashboard`
- `/seller/products`
- `/seller/orders`
- `/seller/profile`

### Behavior changes

- Sellers now have a clearer operator-style console:
  - overview for metrics and shortcuts
  - products for listing management
  - orders for seller-attributed order review
  - profile for store identity management
- Seller sidebar navigation now reflects these separate workflows.

### Validation

- `npm run build`: passed
- `mvn test`: passed

### Next recommended phase

1. seller order actions such as fulfillment state updates
2. admin approval flow for seller profiles
3. dedicated user-side profile/support/account settings screens

## 14. Phase 4 Approvals And Fulfillment

### What changed

- Added admin approval controls for seller profiles
- Made new seller profiles start in a pending-approval state
- Prevented unapproved sellers from creating or editing products
- Added seller-controlled fulfillment status per seller-owned order item
- Exposed the new workflows in the seller and admin frontend screens

### Backend changes

- `SellerProfileService` now defaults new seller profiles to pending approval
- `ProductController` now requires approved seller profiles before seller product management
- `OrderItem` now stores `sellerFulfillmentStatus`
- `SellerController` now exposes seller order status updates
- `AdminManagementController` now exposes seller profile approval APIs

### Frontend changes

- `SellerOrders.jsx` now lets sellers move fulfillment through `PENDING`, `PACKING`, `READY_TO_SHIP`, and `SHIPPED`
- `AdminManagement.jsx` now includes a seller approval queue under the users tab
- `adminService.js` and `sellerService.js` now call the new approval and fulfillment APIs

### Validation

- `npm run build`: passed
- `mvn test`: passed

### Current outcome

The platform now has working lifecycle controls for both sides of the SaaS model:

- admins can approve or hold seller stores
- sellers can update fulfillment progress for their own order items

### Suggested next phase

1. add seller-facing shipment tracking / dispatch metadata
2. add admin moderation notes or compliance reasons for seller approvals
3. build user account/profile/support areas with the same route separation

## 15. Full Debug Pass Update

### Issue identified

During the full runtime review, the admin seller-approval screen still depended on a nested `profile.user` object in the frontend, while the safer SaaS direction is to return a seller-profile DTO from the backend.

That mismatch created two risks:

- the admin approval screen could fail or render incomplete data if lazy-loaded `user` data was not serialized
- the API contract was inconsistent with the rest of the seller-profile flow

### Expected vs actual

Expected:

- `/api/admin/seller-profiles` should return stable seller-profile data for the admin UI
- the admin approval queue should render seller/store/contact fields without depending on JPA entity serialization details
- pending sellers should understand why product creation is blocked

Actual:

- `AdminManagement.jsx` used `profile.user?.name` and `profile.user?.email`
- `AdminManagementController` returned `SellerProfile` entities directly
- seller dashboards did not clearly explain the pending-approval restriction before a seller tried to add a product

### Root cause

The issue came from a response-shape mismatch between frontend expectations and backend implementation:

1. the backend returned persistence entities instead of a dedicated admin-safe DTO
2. the frontend still assumed nested relational data would always be present
3. seller approval state existed, but the seller workspace did not surface that restriction clearly enough

### Fixes applied

Updated backend:

- `Backend/SignupForm/SignupForm/src/main/java/com/SignupForm/service/AdminService.java`
- `Backend/SignupForm/SignupForm/src/main/java/com/SignupForm/controller/AdminManagementController.java`

Behavior:

- admin seller-profile endpoints now return `SellerProfileResponse` DTOs instead of raw `SellerProfile` entities
- seller approval updates also return the same DTO shape

Updated frontend:

- `Frontend/src/pages/AdminManagement.jsx`
- `Frontend/src/pages/SellerDashboard.jsx`

Behavior:

- admin UI now reads `sellerName` and `contactEmail` directly from the DTO
- seller overview now shows a pending-approval message
- the seller `Add Product` button is disabled until approval

### Before vs after

```diff
-public ResponseEntity<List<SellerProfile>> getSellerProfiles()
+public ResponseEntity<List<SellerProfileResponse>> getSellerProfiles()
```

```diff
-<td>{profile.user?.name || profile.sellerName}</td>
-<td>{profile.contactEmail || profile.user?.email}</td>
+<td>{profile.sellerName}</td>
+<td>{profile.contactEmail}</td>
```

```diff
-<button onClick={() => navigate(getAddProductPathForRole("SELLER"))}>Add Product</button>
+<button
+  onClick={() => navigate(getAddProductPathForRole("SELLER"))}
+  disabled={!isApprovedSeller}
+>
+  Add Product
+</button>
```

### Impact

- admin seller approvals are now less fragile at runtime
- the backend no longer relies on JPA entity serialization for this admin workflow
- pending sellers get clearer product-management behavior in the UI

### Validation

1. `npm run build` in `Frontend/`: passed
2. `mvn test` in `Backend/SignupForm/SignupForm/`: passed

## 18. Admin Governance Flow Debug Update

### Issue identified

The admin area was not behaving consistently when changing user roles and reviewing the seller approval queue.

### Expected vs actual

Expected:

- admin role changes should immediately reflect in the admin UI
- the seller approval queue should only contain real seller accounts
- promoting a user to `SELLER` should provision the seller domain immediately

Actual:

- role changes updated the user row, but the seller approval queue could fall out of sync
- seller profiles could remain visible in the queue even when the linked user was no longer a seller
- changing a role to `SELLER` did not proactively provision the seller profile in the admin workflow

### Root cause analysis

The admin workflow had a data consistency gap:

1. admin users were fetched separately from seller profiles
2. changing a user role did not refresh the seller queue on the frontend
3. seller profiles were listed without filtering by the linked user's current role
4. seller profile creation was not triggered directly by admin role promotion

### Fixes applied

Updated backend:

- `Backend/SignupForm/SignupForm/src/main/java/com/SignupForm/repository/SellerProfileRepository.java`
- `Backend/SignupForm/SignupForm/src/main/java/com/SignupForm/service/AdminService.java`
- `Backend/SignupForm/SignupForm/src/main/java/com/SignupForm/controller/AdminManagementController.java`

Updated frontend:

- `Frontend/src/pages/AdminManagement.jsx`

Behavior:

- admin user list now returns a safer `UserResponse` shape
- promoting a user to `SELLER` now provisions a seller profile immediately
- seller profile listings are filtered to users whose current role is actually `SELLER`
- the admin UI refreshes seller profiles right after role changes

### Before vs after

```diff
-public List<Users> getAllUsers()
+public List<UserResponse> getAllUsers()
```

```diff
-return sellerProfileRepository.findAllByOrderByApprovedAscStoreNameAsc()
+return sellerProfileRepository.findAllByOrderByApprovedAscStoreNameAsc()
+        .stream()
+        .filter(profile -> profile.getUser() != null && profile.getUser().getRole() == Role.SELLER)
```

```diff
-await changeUserRole(userId, newRole);
-setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
+const updatedUser = await changeUserRole(userId, newRole);
+setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedUser } : u));
+const refreshedSellerProfiles = await fetchSellerProfiles();
+setSellerProfiles(Array.isArray(refreshedSellerProfiles) ? refreshedSellerProfiles : []);
```

### Impact

- admin governance screens now stay in sync after role updates
- the seller approval queue is more trustworthy
- seller onboarding through admin role promotion is more complete

### Validation

1. `mvn test` in `Backend/SignupForm/SignupForm/`: passed
2. `npm run build` in `Frontend/`: passed

## 17. Lazy Loading Order Fix

### Issue identified

The backend raised:

- `Cannot lazily initialize collection of role 'com.SignupForm.entity.Order.orderItems' ... (no session)`

### Expected vs actual

Expected:

- user order history and sustainability insights should be able to read order items safely
- order-related DTO mapping should not depend on an open Hibernate session outside the fetch scope

Actual:

- some order reads loaded `Order` entities first and then touched `orderItems` later
- because `spring.jpa.open-in-view` is disabled, lazy collections could fail with `no session`

### Root cause analysis

The main cause was fetch strategy:

1. `InsightsService` used `findByEmailOrderByOrderDateAsc(email)` and then iterated `order.getOrderItems()`
2. `OrderService` also relied on generic order fetches for DTO mapping
3. those repository methods did not guarantee eager loading of `orderItems`, nested `product`, or `address`

### Fixes applied

Updated:

- `Backend/SignupForm/SignupForm/src/main/java/com/SignupForm/repository/OrderRepository.java`
- `Backend/SignupForm/SignupForm/src/main/java/com/SignupForm/service/InsightsService.java`
- `Backend/SignupForm/SignupForm/src/main/java/com/SignupForm/service/OrderService.java`

Behavior:

- added `@EntityGraph` fetch plans for order history and insights reads
- added a user-scoped eager order lookup for single-order fetches
- marked `InsightsService.getInsightsData` as `@Transactional(readOnly = true)`
- updated `OrderService` to use eager repository methods for mapping

### Before vs after

```diff
-List<Order> findByEmailOrderByOrderDateAsc(String email);
+@EntityGraph(attributePaths = {"orderItems", "orderItems.product"})
+List<Order> findByEmailOrderByOrderDateAsc(String email);
```

```diff
-for (Order order : orderRepository.findByUser(user)) {
+for (Order order : orderRepository.findByUserOrderByOrderDateDesc(user)) {
```

```diff
-Order order = orderRepository.findById(orderId)
-        .orElseThrow(() -> new RuntimeException("Order not found"));
+Order order = orderRepository.findByIdAndUserEmail(orderId, email)
+        .orElseThrow(() -> new RuntimeException("Order not found"));
```

### Impact

- order history and carbon insights are less likely to fail on lazy collection access
- backend order DTO mapping is now aligned with `spring.jpa.open-in-view=false`

### Validation

1. `npm run build` in `Frontend/`: passed
2. `mvn test` in `Backend/SignupForm/SignupForm/`: passed

## 16. Sustainability Insights Debug Update

### Issue identified

The sustainability page showed:

- `Unable to load sustainability data. Please check your connection.`

### Expected vs actual

Expected:

- buyer accounts should be able to load their carbon insights
- the page should show a useful error if the request is unauthorized or the session expired
- older or incomplete order data should not crash the backend insights service

Actual:

- the frontend collapsed all failures into a generic connection message
- the backend insights service assumed every order had a non-null `orderDate`
- admin-mode logic on the frontend still attempted to support an admin insights view even though the secured user insights endpoint is user-only

### Root cause analysis

Multiple causes were possible:

1. backend unavailable
2. expired or missing JWT token
3. 403 response caused by role mismatch
4. backend 500 caused by null order dates in existing data

The most likely true causes in the code were:

- fragile backend trend generation using `o.getOrderDate().getMonth()` without a null guard
- frontend insights loading that hid authorization/runtime errors behind one generic message

### Fixes applied

Updated backend:

- `Backend/SignupForm/SignupForm/src/main/java/com/SignupForm/service/InsightsService.java`

Behavior:

- trend generation now ignores orders with null `orderDate` instead of crashing

Updated frontend:

- `Frontend/src/services/insightsService.js`
- `Frontend/src/pages/CarbonInsights.jsx`

Behavior:

- insights requests now return clearer messages for `401`, `403`, and network failures
- admin insights loading no longer depends on fetching the user-only insights endpoint first
- the page now shows the real error message instead of always blaming the connection

### Before vs after

```diff
-Map<String, Double> trendMap = orders.stream()
+List<Order> datedOrders = orders.stream()
+        .filter(order -> order.getOrderDate() != null)
+        .toList();
+
+Map<String, Double> trendMap = datedOrders.stream()
```

```diff
-setError("Unable to load sustainability data. Please check your connection.");
+setError(err.message || "Unable to load sustainability data. Please check your connection.");
```

### Impact

- existing users with older/incomplete order rows are less likely to hit a backend 500
- sustainability errors are now easier to diagnose
- admin-specific insights loading is less fragile

### Validation

1. `npm run build` in `Frontend/`: passed
2. `mvn test` in `Backend/SignupForm/SignupForm/`: passed
