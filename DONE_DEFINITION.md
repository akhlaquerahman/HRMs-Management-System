# Definition of Done (DoD)

A user story, feature, or bug fix is NOT considered "Done" until every single item on this list is satisfied.

## 1. Code Quality
- [ ] Code is peer-reviewed and approved by at least one Senior Developer.
- [ ] No `any` types remain; strict TypeScript typings are enforced.
- [ ] Code passes all linting rules (`npm run lint`).
- [ ] No console logs, debug statements, or commented-out dead code remain.

## 2. Testing
- [ ] Unit tests are written for all complex business logic (Services/Utils).
- [ ] Code coverage for new logic is > 80%.
- [ ] All existing automated tests pass (`npm run test`).
- [ ] Feature has been manually tested in a local or staging environment.

## 3. Documentation
- [ ] Swagger/OpenAPI documentation is updated for any API changes.
- [ ] Prisma schema comments are updated if database models changed.
- [ ] `README.md` or feature-specific documentation is updated if environment variables or setup steps changed.

## 4. UI/UX (If Applicable)
- [ ] Feature matches Figma/UI specifications precisely.
- [ ] UI is responsive and tested on Mobile, Tablet, and Desktop breakpoints.
- [ ] Dark Mode support is verified.
- [ ] Accessibility: Tab navigation works, and ARIA labels are present for screen readers.

## 5. Security & Performance
- [ ] Inputs are validated via Zod on both client and server.
- [ ] Endpoints are protected by appropriate RBAC rules.
- [ ] No N+1 query problems introduced in Prisma.
- [ ] Large UI assets (images/libraries) are optimized and lazy-loaded.

## 6. Deployment
- [ ] Database migrations (`prisma migrate`) have been tested and included.
- [ ] Feature is safely merged into `main` without merge conflicts.
