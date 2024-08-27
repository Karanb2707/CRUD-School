const express = require("express");
const router = express.Router();

const schoolController = require("../controller/school.controller");

router.get("/getSchools", schoolController.getAll);
router.post("/addSchools", schoolController.create);

module.exports = router;
