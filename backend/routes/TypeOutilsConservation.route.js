const express = require("express");
const router = express.Router();
const {
  getAllTypeOutilsConservation,
  getTypeOutilsConservationById,
  createTypeOutilsConservation,
  updateTypeOutilsConservation,
  deleteTypeOutilsConservation,
} = require("../controllers/TypeOutilsConservation.controller");

router.get("/", getAllTypeOutilsConservation);
router.get("/:id", getTypeOutilsConservationById);
router.post("/", createTypeOutilsConservation);
router.put("/:id", updateTypeOutilsConservation);
router.delete("/:id", deleteTypeOutilsConservation);

module.exports = router;
