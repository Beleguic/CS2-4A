const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const checkAuth = require("../middlewares/checkAuth");

router.get("/list", categoryController.getAllCategoriesForSelection);
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/new", checkAuth, categoryController.createCategory);
router.patch("/:id", checkAuth, categoryController.updateCategory);
router.delete("/:id", checkAuth, categoryController.deleteCategory);

module.exports = router;
