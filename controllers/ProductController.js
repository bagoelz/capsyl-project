import vine, { errors } from "@vinejs/vine";
import { productScheme } from "../validations/productValidation.js";
import { imageValidator, removeImage, uploadImage } from "../utils/helper.js";
import prisma from "../DB/db.config.js";
import ProductApiTransform from "../transform/productApiTransform.js";
//import redisCache from "../DB/redis.config.js";
import logger from "../config/logger.js";

class ProductController {
  static async index(req, res) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (page <= 0) {
      page = 1;
    }
    if (limit <= 0 || limit > 100) {
      limit = 10;
    }
    const skip = (page - 1) * limit;

    const products = await prisma.product_category.findMany({
      include: {
        products: {
          select: {
            id: true,
            category_id: true,
            title: true,
            slug: true,
            lang: true,
            auth_id: true,
            status: true,
            type: true,
            count: true,
            pivot: {
              select: {
                category_id: true,
                term_id: true,
              },
            },
            price: true,
            preview: true,
            stock: true,
          },
        },
      },
    });
   

    const totalProduct = await prisma.product.count();
    const totalPages = Math.ceil(totalProduct / limit);

    return res.json({
      status: 200,
      products: products,
      metadata: {
        totalPages,
        currentPage: page,
        currentLimit: limit,
      },
    });
  }

  static async getnetxtId() {
    const data = await prisma.product.findFirst({
      orderBy: {
        id: "desc",
      },
    });
    return data;
  }

  static async store(req, res) {
    try {
      const user = req.user;
      const body = req.body;
      const validator = vine.compile(productScheme);
      const payload = await validator.validate(body);

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          errors: {
            image: "Image field is required.",
          },
        });
      }
      const image = req.files?.image;
      //   * Image custom validator
      const message = imageValidator(image?.size, image?.mimetype);
      if (message !== null) {
        return res.status(400).json({
          errors: {
            image: message,
          },
        });
      }
      //   * Image upload
      const imageName = uploadImage(image);
      payload.image = imageName;
      payload.user_id = user.id;

      const dataid = await prisma.product.findFirst({
        take: 1,
        orderBy: {
          id: "desc",
        },
      });
      const nextId = dataid == null ? 1 : parseInt(dataid["id"]) + 1;
      const dataProduct = {
        id: nextId,
        title: payload.name,
        slug: payload.name,
        auth_id: payload.user_id,
        category_id: payload.category_id,
      };

      const dataPivot = {
        term_id: nextId,
        category_id: payload.category_id,
      };

      const dataPrice = {
        term_id: nextId,
        price: payload.price,
      };

      const dataPreview = {
        term_id: nextId,
        content: imageName,
      };

      const dataStock = {
        term_id: nextId,
        stock: 0,
      };

      const product = await prisma.$transaction([
        prisma.product.create({ data: dataProduct }),
        prisma.price.create({ data: dataPrice }),
        prisma.preview.create({ data: dataPreview }),
        prisma.pivot.create({ data: dataPivot }),
        prisma.stock.create({ data: dataStock }),
      ]);

      //   * remove cache
      // redisCache.del("/api/product", (err) => {
      //   if (err) throw err;
      // });

      return res.json({
        status: 200,
        message: "Product created successfully!",
        product,
      });
    } catch (error) {
      logger.error(error);
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // console.log(error.messages);
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong.Please try again.",
        });
      }
    }
  }

  static async show(req, res) {
    try {
      const { id } = req.params;
      const products = await prisma.product.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          pivot: {
            select: {
              category_id: true,
              term_id: true,
            },
          },
          price: true,
          preview: true,
          stock: true,
        },
      });
      return res.json({ status: 200, products: products });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Something went wrong.please try again." });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const body = req.body;
      const products = await prisma.product.findUnique({
        where: {
          id: Number(id),
        },
      });
      if (user.id !== products.auth_id) {
        return res.status(400).json({ message: "UnAtuhorized" });
      }
      const validator = vine.compile(productScheme);
      const payload = await validator.validate(body);
      const image = req?.files?.image;

      if (image) {
        const message = imageValidator(image?.size, image?.mimetype);
        if (message !== null) {
          return res.status(400).json({
            errors: {
              image: message,
            },
          });
        }

        //   * Upload new image
        const imageName = uploadImage(image);
        payload.image = imageName;
        // * Delete old image
        removeImage(products.image);
      }

      const idProduct = payload.id;
      const dataProduct = {
        title: payload.name,
        slug: payload.name,
        auth_id: payload.user_id,
        category_id: payload.category_id,
      };

      const dataPivot = {
        term_id: idProduct,
        category_id: payload.category_id,
      };

      const dataPrice = {
        term_id: idProduct,
        price: payload.price,
      };

      const dataPreview = {
        term_id: idProduct,
        content: payload.image,
      };

  
      const product = await prisma.$transaction([
        prisma.product.create({ data: dataProduct }),
        prisma.price.create({ data: dataPrice }),
        prisma.preview.create({ data: dataPreview }),
        prisma.pivot.create({ data: dataPivot }),
      ]);

      return res.status(200).json({ message: "Product updated successfully!" });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // console.log(error.messages);
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong.Please try again.",
        });
      }
    }
  }

  static async destroy(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const product = await prisma.product.findUnique({
        where: {
          id: Number(id),
        },
      });
      if (user.id !== product?.auth_id) {
        return res.status(401).json({ message: "Un Authorized" });
      }

      // * Delete image from filesystem
      removeImage(product.image);
      await prisma.product.delete({
        where: {
          id: Number(id),
        },
      });
      return res.json({ message: "Product deleted successfully!" });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Something went wrong.Please try again.",
      });
    }
  }
}

export default ProductController;
