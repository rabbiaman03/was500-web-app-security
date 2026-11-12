// Routes say WHAT endpoints exist and which checks run first.
// HOW each one behaves lives in the controller - no business logic in this file.
const express = require("express");
const controller = require("../controllers/contributors.controller");
const { contributorBody, idParam, listQuery, handleValidation } = require("../middlewares/validators");

const router = express.Router();

router
  .route("/")
  .get(listQuery, handleValidation, controller.list) // GET    /api/v1/contributors
  .post(contributorBody, handleValidation, controller.create); // POST   /api/v1/contributors

router
  .route("/:id")
  .get(idParam, handleValidation, controller.getById) // GET    /api/v1/contributors/:id
  .put(idParam, contributorBody, handleValidation, controller.replace) // PUT    /api/v1/contributors/:id
  .delete(idParam, handleValidation, controller.remove); // DELETE /api/v1/contributors/:id

module.exports = router;
