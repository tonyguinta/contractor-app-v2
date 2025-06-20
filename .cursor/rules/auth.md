# Authentication

- Use **JWT authentication** via FastAPI.
- Auth flow is:
  1. User logs in → receives JWT
  2. JWT is stored in localStorage on frontend
  3. JWT is passed in `Authorization: Bearer <token>` header on every request

Frontend must:
- Redirect to login if JWT is missing or expired
- Use Axios interceptors for automatic auth header injection

Backend must:
- Validate JWT in all protected routes using `Depends(get_current_user)`
