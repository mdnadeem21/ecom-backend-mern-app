const express = require("express")
const router = express.Router()

const {isSignedIn, isAuthenticated, isAdmin} = require("../controllers/auth")
const {getUserById} = require("../controllers/user")
const { getProductById, createProduct, photo,getProduct, updateProduct, removeProduct, getAllProducts, getAllUniqueCategories } = require("../controllers/product")
//params
router.param("userId",getUserById)
router.param("productId",getProductById)

//routes
//read routes
router.get("/product/:productId",getProduct)
router.get("/product/photo/:productId",photo)

//create routes
router.post("/product/create/:userId", isSignedIn, isAuthenticated, isAdmin, createProduct)


//update route
router.put("/product/:productId/:userId",isSignedIn, isAuthenticated, isAdmin, updateProduct)


//delete route
router.delete("/product/:productId/:userId",isSignedIn, isAuthenticated, isAdmin, removeProduct)

//listing route
router.get("/products",getAllProducts)

router.get("/products/categories",getAllUniqueCategories)



module.exports = router;