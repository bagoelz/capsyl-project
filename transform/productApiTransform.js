import { getImageUrl } from "../utils/helper.js";

class ProductApiTransform {
  static transform(data) {
    return {
      id: data.id,
      name: data.name,
      user_id: data.user_id,
      products: data.products,
      image: getImageUrl(news.image),
      created_at: news.created_at,
    };
  }
}

export default ProductApiTransform;
