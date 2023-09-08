const Product = require("../models/product")
const formidable = require("formidable")
const _ = require("lodash")
const fs = require("fs")

exports.getProductById = (req,res,next,id) =>{
    Product.findById(id)
    .populate("category") // it will populate the data according to categories
    .exec((err,product) =>{
        if(err){
            return res.status(400).json({
                erro : "No product found in DB"
            })
        }
        req.product = product
        next() 
    })
}

exports.createProduct = (req,res) =>{
    let form = new formidable.IncomingForm()
    form.keepExtensions = true

    form.parse(req, (err,fields,file) =>{
        if(err){
            return res.status(400).json({
                error : "Problem with image"
            })
        }
        //destructure the fields
        const { name,description, price, category, stock} = fields

        if(
            !name ||
            !description ||
            !price ||
            !category ||
            !stock
            
        ){
            return res.status(400).json({
                error : "please include all fields"
            })

        }

        let product = new Product(fields)

        //handle file
        if(file.photo){
            if(file.photo.size > 3000000){
                return res.status(400).json({
                    error : "File sie is too big"
                })
            }
            product.photo.data = fs.readFileSync(file.photo.path)
            product.photo.contentType = file.photo.contentType
        }

        //save to DB
        product.save( (err,product) =>{
            if(err){
                return res.status(400).json({
                    error : "Failed to saving product in DB"
                })
            }
            res.json(product)
        })
    })
}

exports.getProduct = (req,res) =>{
    req.product.photo = undefined
    return res.json(req.product)
}

//middleware
exports.photo = (req,res,next) =>{
    if(req.product.photo.data){
        res.set("Content-Type",req.product.photo.contentType)
        return res.send(req.product.photo.data)
    }
    next()
}

//update controller
exports.updateProduct = (req,res) =>{
    let form = new formidable.IncomingForm()
    form.keepExtensions = true

    form.parse(req, (err,fields,file) =>{
        if(err){
            return res.status(400).json({
                error : "Problem with image"
            })
        }
        

        //updation code
        let product = req.prodcut
        product = _.extend(product, fields)

        //handle file
        if(file.photo){
            if(file.photo.size > 3000000){
                return res.status(400).json({
                    error : "File sie is too big"
                })
            }
            product.photo.data = fs.readFileSync(file.photo.path)
            product.photo.contentType = file.photo.contentType
        }

        //save to DB
        product.save( (err,product) =>{
            if(err){
                return res.status(400).json({
                    error : "Failed to update product in DB"
                })
            }
            res.json(product)
        })
    })

}

//remove controller
exports.removeProduct = (req,res) =>{
    let product = req.product
    product.remove((err,deletedProduct) =>{
        if(err){
            return res.status(400).json({
                error : "Failed to delete product form DB"
            })
        }
        res.json({
            message : `${deletedProduct} is deleted Successfully!!`
        })
    })
}


//product listing
exports.getAllProducts = (req,res) =>{
    let limit = req.query.limit ? parseInt(req.query.limit) :  8
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id" 
     Product.find()
     .select("-photo")
     .populate("category")
     .sort([[sortBy, "asc"]])
     .limit(limit)
     .exec((err,products) =>{
        if(err){
            return res.status(400).json({
               error : "No product found" 
            })
        }
        res.json(products)
     })
}


exports.updateStock = (req,res,next) =>{
    let myOperations = req.body.order.products.map( prod =>{
        return {
            updateOne :{
                filter : {_id : prod._id},
                update : {$inc : {stock : -prod.count, sold : +prod.count}}
            }
        }
    })

    Product.bulkWrite(myOperations,{}, (err,products) =>{
        if(err){
            return res.status(400).json({
                error : "Bulk operartion failed"
            })
        }
        next();
    })
} 


exports.getAllUniqueCategories = (res,req) =>{
    Product.distinct("category",{},(err,category) =>{
        if(err){
            return res.status(400).json({
                error : "No category found"
            })
        }
        res.json(category)
    })
}