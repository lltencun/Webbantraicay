import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import productDetailModel from "../models/productDetailModel.js";
import ProductType from "../models/productTypeModel.js";

// function  for add product
export const addProduct = async (req, res) => {
  try {      
    const {
      productCode,
      name,
      description,
      category,
      type,
      origin_id,
      product_type_id
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || !type || !origin_id || !product_type_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Validate product type exists
    const productType = await ProductType.findById(product_type_id);
    if (!productType) {
      return res.status(400).json({
        success: false,
        message: "Invalid product type"
      });
    }

    const image1 = req.files?.image1 && req.files.image1[0];
    const image2 = req.files?.image2 && req.files.image2[0];
    const image3 = req.files?.image3 && req.files.image3[0];
    const image4 = req.files?.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required"
      });
    }    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    // Tạo mã sản phẩm nếu không được cung cấp
    const finalProductCode = productCode || `PRD${Date.now()}`;

    // Kiểm tra xem mã sản phẩm đã tồn tại chưa
    const existingProduct = await productModel.findOne({ productCode: finalProductCode });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product code already exists"
      });
    }    const productData = {
      productCode: finalProductCode,
      name,
      description,      
      category,
      type,
      image: imagesUrl,
      date: Date.now(),
      origin_id,
      product_type_id,
    };

    const product = new productModel(productData);
    await product.save();
    
    res.json({
      success: true,
      message: "Thêm sản phẩm thành công.",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

//function for list product
export const listProducts = async (req, res) => {
  try {
    console.log("Fetching products...");
    // Get products with populated origin and product type information
    const products = await productModel.find()
      .sort({ date: -1 })      .populate({
        path: 'origin_id',
        select: 'country farm_name' // Include country and farm_name from origin
      })
      .populate({
        path: 'product_type_id',
        select: 'name code category type' // Include all relevant fields from product type
      });

    // Lấy thông tin chi tiết sản phẩm và gộp vào kết quả
    const productsWithDetails = await Promise.all(
      products.map(async (product) => {
        const detail = await productDetailModel.findOne({
          product_id: product._id,
        });
        
        const productObject = product.toObject();
        
        return {          ...productObject,
          sizes: detail?.sizes || [],
          price: detail?.price || 0,
          available: detail?.available || false,
          bestseller: detail?.bestseller || false,          // Keep both the original and normalized structure for compatibility
          origin: productObject.origin_id || { country: 'N/A', farm_name: 'N/A' },
          origin_id: productObject.origin_id || { country: 'N/A', farm_name: 'N/A' },
          product_type: productObject.product_type_id || { code: 'N/A', category: 'N/A', type: 'N/A' },
          product_type_id: productObject.product_type_id || { code: 'N/A', category: 'N/A', type: 'N/A' },
        };
      })
    );

    console.log("Found products:", productsWithDetails);
    res.json({ success: true, products: productsWithDetails });
  } catch (error) {
    console.error("Error in listProducts:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//function for remove product
export const removeProduct = async (req, res) => {
  try {
    const { id } = req.body;
    
    // Check if product detail exists
    const productDetail = await productDetailModel.findOne({ product_id: id });
    if (productDetail) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa sản phẩm vì còn tồn tại chi tiết sản phẩm. Vui lòng xóa chi tiết sản phẩm trước."
      });
    }
    
    // If no product detail exists, proceed with deletion
    await productModel.findByIdAndDelete(id);
    
    res.json({ success: true, message: "Đã xóa sản phẩm thành công" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
//update
export const updateProduct = async (req, res) => {
  try {    const {
      id,
      productCode,
      name,
      description,
      sizes,
      price,
      product_type_id,
      available,
      bestseller,
      origin_id,
      color,
      nutritional_info,
    } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    const image1 = req.files?.image1 && req.files.image1[0];
    const image2 = req.files?.image2 && req.files.image2[0];
    const image3 = req.files?.image3 && req.files.image3[0];
    const image4 = req.files?.image4 && req.files.image4[0];

    const existingImages = req.body.existingImages ? 
      (Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages]) 
      : [];

    const newImages = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );
    
    let imagesUrl = [...existingImages];

    if (newImages.length > 0) {
      try {
        const uploadedImages = await Promise.all(
          newImages.map(async (item) => {
            let result = await cloudinary.uploader.upload(item.path, {
              resource_type: "image",
            });
            return result.secure_url;
          })
        );
        imagesUrl = [...imagesUrl, ...uploadedImages];
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Error uploading images to cloud storage",
        });
      }
    }    // Validate và lấy thông tin product type
    let productType = null;
    if (product_type_id) {
      productType = await ProductType.findById(product_type_id);
      if (!productType) {
        return res.status(400).json({
          success: false,
          message: "Invalid product type"
        });
      }
    }    // Kiểm tra productCode nếu được cung cấp
    if (productCode) {
      const existingProduct = await productModel.findOne({ 
        productCode, 
        _id: { $ne: id } // Loại trừ sản phẩm hiện tại
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "Product code already exists"
        });
      }
    }

    const productData = {
      ...(productCode && { productCode }),
      ...(name && { name }),
      ...(description && { description }),
      ...(productType && {
        product_type_id: productType._id,
        category: productType.category,
        type: productType.type
      }),
      ...(origin_id && { origin_id }),
      ...(imagesUrl.length > 0 && { image: imagesUrl }),
    };

    // Kiểm tra và parse sizes
    let parsedSizes = [];
    if (sizes) {
      try {
        parsedSizes = Array.isArray(sizes) ? sizes : JSON.parse(sizes);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid sizes format. Expected JSON array",
        });
      }
    }

    // Cập nhật product detail
    const productDetailData = {
      ...(color && { color }),
      ...(nutritional_info && { nutritional_info }),
      ...(parsedSizes.length > 0 && { sizes: parsedSizes }),
      ...(price && { price: Number(price) }),      ...(available !== undefined && { available: String(available) === "true" || available === true }),
      ...(bestseller !== undefined && { bestseller: String(bestseller) === "true" || bestseller === true }),
    };

    // Kiểm tra xem có dữ liệu cập nhật không
    if (
      Object.keys(productData).length === 0 &&
      Object.keys(productDetailData).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No data provided for update",
      });
    }

    const updatedProduct = await productModel.findByIdAndUpdate(id, productData, {
      new: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const updatedProductDetail = await productDetailModel.findOneAndUpdate(
      { product_id: id },
      productDetailData,
      { new: true }
    );

    res.json({
      success: true,
      message: "Cập nhật sản phẩm thành công.",
      product: updatedProduct,
      productDetail: updatedProductDetail,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật sản phẩm: " + error.message,
    });
  }
};
//function for single product info
export const singleProduct = async (req, res) => {
  try {
    // Get productId from either params (GET /:id) or body (POST /single)
    const productId = req.params.id || req.body.productId;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    const product = await productModel.findById(productId)
      .populate({
        path: 'origin_id',
        select: 'country farm_name'
      })
      .populate({
        path: 'product_type_id',
        select: 'name code category type'
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Get product details
    const productDetail = await productDetailModel.findOne({
      product_id: productId
    });

    const productData = {
      ...product.toObject(),
      sizes: productDetail?.sizes || [],
      price: productDetail?.price || 0,
      available: productDetail?.available || false,
      bestseller: productDetail?.bestseller || false,
      color: productDetail?.color,
      nutritional_info: productDetail?.nutritional_info,
      origin: product.origin_id,
      product_type: product.product_type_id
    };

    res.json({ 
      success: true, 
      product: productData 
    });
  } catch (error) {
    console.error("Error in singleProduct:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
