import mongoose, { mongo } from "mongoose";

const productSchema = new mongoose.Schema({
  productCode: { type: String, unique: true }, // Không bắt buộc vì sẽ tự tạo nếu không có
  name: { type: String, required: true },
  image: { type: Array, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, required: true },
  date: { type: Number, required: true },
  origin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Origin',
    required: true
  },
  product_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductType',
    required: true
  }
});
const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);
export default productModel;
