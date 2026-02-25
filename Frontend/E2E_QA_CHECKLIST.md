# Frontend E2E / QA Checklist

## Auth
- Signup works for selected role and stores token + user.
- Login redirects to dashboard.
- Forgot password: OTP request and reset flow succeed with backend responses.

## Navigation
- Navbar links: Home, Catalog, Cart, Checkout.
- Protected routes redirect unauthenticated users to `/login`.

## Catalog
- Product list loads with skeleton state.
- Search + eco filter + carbon filter work.
- Pagination Previous/Next works.
- Image fallback works for broken image URLs.

## Product Detail
- Detail page loads with skeleton.
- Add to cart works and shows toast.
- Retry button appears and works on API failure.

## Cart
- Quantity update, remove item, and greener swap work.
- Summary values update immediately.
- Retry button appears for alternatives API error.

## Checkout
- Inline helper text visible.
- Validation blocks empty fields.
- Place order success shows confirmation card.

## Accessibility
- Keyboard focus visible on inputs/buttons.
- Click targets are readable and usable on mobile.

## Cross-browser smoke
- Chrome latest
- Edge latest
- Firefox latest
