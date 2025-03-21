TODO:

- [x] 1. Finilize registration (send verification code, use emailService)
- [x] 2. Follow routers structure (suggested into routers/auth.js)
- [x] 3. Handle error in one place (use custom errors, see middlewaress/error_handler.js)
- [x] 4. Implement api/auth/resendCode endpoint
- [ ] 5. Use swagger as validator for inputs
- [ ] 6. Write docs for currect endpoints
- [ ] 7. Separate routers logic to services (create services/user.js)
- [ ] 8. Move helpers, mappers, middlewares, models, routers, services -> src (should be created)
- [ ] 9. Use secret (process.env.SECRET) for token generation
- [ ] 10. Use different algorithms for access token and refresh tokens
- [ ] 11. Clean up code (remove unused variables/imports)
- [ ] 12. Create other database instanse (prob. NeonDB)
- [ ] 13. Start using migration instead of sync()
- [ ] 14. Move logging() from index.js to middlewares/logging.js <--create new file
- [ ] 15. implement new endpoint GET /api/shared/politicalAffiliation -> return [{ key: string, value: string}] ex. [{ key: "DEMOCRATIC_PARTY", value: "Democratic party" }, ...]
- [ ] 16. Change number 4->6 number of digit which generated for email verification

Bugs:

- [x] Fix issue when /login with wrong email
      -> Expect:
      status: 401 message: WRONG_CREDENTIAL
      -> Got:
      status: 500 message: UNHANDLED
