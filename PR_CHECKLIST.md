# Pull Request Checklist

Before marking your PR as "Ready for Review", ensure you have completed the following checklist. Copy this into your PR description.

## 🔍 Pre-Review Checks
- [ ] My code follows the [Engineering Guardrails](./ENGINEERING_GUARDRAILS.md).
- [ ] I have performed a self-review of my own code.
- [ ] I have commented my code, particularly in hard-to-understand areas.
- [ ] I have made corresponding changes to the documentation (Swagger, README).
- [ ] My changes generate no new warnings (TypeScript, ESLint).

## 🧪 Testing
- [ ] I have added tests that prove my fix is effective or that my feature works.
- [ ] New and existing unit tests pass locally with my changes.
- [ ] I have tested this manually on multiple browsers (Chrome, Firefox, Safari) [If UI].

## 🛡️ Security & Performance
- [ ] New endpoints have appropriate authentication and RBAC middleware applied.
- [ ] All user inputs are validated using Zod.
- [ ] No secrets or sensitive data are hardcoded or logged.
- [ ] I have checked for and eliminated potential N+1 database queries.

## 📸 Visuals (If UI changed)
- [ ] I have attached screenshots or a screen recording demonstrating the UI changes (Light and Dark mode).

---
*Reviewers: Please refer to the [Definition of Done](./DONE_DEFINITION.md) before approving this PR.*
