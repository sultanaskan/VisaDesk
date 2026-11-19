# Project Documentation

This documentation describes the unified Visa Slot Agency application, including its API and client/admin workspaces.

## Documentation index

- [Product and business requirements](PRODUCT_REQUIREMENTS.md)
- [Architecture and database design](ARCHITECTURE.md)
- [Admin user guide](ADMIN_GUIDE.md)
- [Agent and individual user guide](CLIENT_GUIDE.md)
- [API reference](API_REFERENCE.md)
- [Setup, deployment and operations](DEPLOYMENT.md)
- [Security and privacy](SECURITY.md)
- [Frontend portal specification](FRONTEND_SPEC.md)
- [Agentic development guide](AGENTIC_DEVELOPMENT.md)

## Scope and status

The application contains the API foundation, Prisma data model, authentication, wallet/deposit workflow, application/document metadata workflow, dynamic route-aware pricing, priority approval workflow, and client/admin frontends. Secure authenticated document streaming, automated tests, full audit logging, production payment gateway integration, email/SMS notifications and production deployment hardening remain planned work.

The term **center** means the visa application/processing center physically located in the **From Country**. If the business later needs a center located in another jurisdiction, the center model and validation rule must be revised explicitly.
