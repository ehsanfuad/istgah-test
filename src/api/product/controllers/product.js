"use strict";

/**
 * product controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::product.product", ({ strapi }) => ({
  getAll: async (ctx, next) => {
    const categoryId = ctx.params.categoryId;
    let products = [];
    const categories = await strapi.entityService.findMany(
      "api::category.category"
    );
    const categoryIds = await strapi
      .service("api::category.category")
      .makeCategoryListIds(categories, categoryId);
    // const product = await strapi.entityService.findMany(
    //   "api::product.product",
    //   {
    //     fields: ["name", "stock", "price", "discountedPrice"],
    //     populate: ["image"],
    //   }
    // );
    //inja baiad product haie cat id o begiram
    if (categoryIds) {
      await Promise.all(
        categoryIds.map(async (categoryId) => {
          const items = await strapi.db.query("api::product.product").findMany({
            select: ["name", "stock", "price", "discountedPrice"],
            where: { category: { id: categoryId } },
            populate: ["image"],
          });
          products.push(...items);
        })
      );
    }

    return products;
  },
  getProduct: async (ctx, next) => {
    const productId = ctx.params.productId;
    let sanitizedProduct = {};
    let features = [];
    let grinds = [];
    let colors = [];
    let weights = [];
    let product_types = [];
    let image = [];
    let images = [];
    const product = await strapi.db.query("api::product.product").findOne({
      where: { id: productId },
      populate: [
        "image",
        "images",
        "feature.features",
        "product_types",
        "color.color",
        "weight.weight",
        "grind.grinds",
      ],
    });
    if (product && product.publishedAt) {
      features = await strapi
        .service("api::product.product")
        .getFeatureList(product?.feature);
      grinds = await strapi
        .service("api::product.product")
        .getStaticList(product?.grind?.grinds);
      product_types = await strapi
        .service("api::product.product")
        .getStaticList(product?.product_types);
      colors = await strapi
        .service("api::product.product")
        .getDynamicList(product?.color, "color");
      weights = await strapi
        .service("api::product.product")
        .getDynamicList(product?.weight, "weight");
      image = await strapi
        .service("api::product.product")
        .sanatizedImage([product?.image], { imgArray: false });
      images = await strapi
        .service("api::product.product")
        .sanatizedImage(product?.images, { imgArray: true });
      sanitizedProduct["id"] = product?.id;
      sanitizedProduct["name"] = product?.name;
      sanitizedProduct["description"] = product?.description;
      sanitizedProduct["price"] = product?.price;
      sanitizedProduct["discountedPrice"] = product?.discountedPrice;
      sanitizedProduct["image"] = image;
      sanitizedProduct["images"] = images;
      sanitizedProduct["features"] = features;
      sanitizedProduct["grinds"] = grinds;
      sanitizedProduct["product_types"] = product_types;
      sanitizedProduct["colors"] = colors;
      sanitizedProduct["weights"] = weights;
    }
    return sanitizedProduct;
  },
}));
