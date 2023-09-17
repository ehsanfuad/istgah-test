"use strict";

/**
 * category service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::category.category", ({ strapi }) => ({
  makeCategoryList: async (categories) => {
    function createCategoryList(categories, parentId = 0) {
      let categoryList = [];
      let cats;
      let category = {};
      if (parentId === 0) {
        cats = categories.filter((cat) => cat.parentId === 0);
      } else {
        cats = categories.filter((cat) => cat.parentId === parentId);
      }
      for (let cat of cats) {
        console.log(cat);
        category = {
          name: cat.name,
          id: cat.id,
          parentId: cat.parentId,
          slug: cat.slug,
          image: cat.image?.url === null ? "" : cat.image?.url,
          parentImage:
            cat.parentImage?.url === null ? "" : cat.parentImage?.url,
          children: createCategoryList(categories, cat.id),
        };
        categoryList.push(category);
      }
      return categoryList;
    }
    return createCategoryList(categories);
  },
  makeCategoryListIds: async (categories, categoryId) => {
    let category = await categories.find((item) => item.id == categoryId);
    let categoryIds = [];
    if (category) {
      let parentId = category.id;
      categoryIds.push(category.id);
      while (parentId != null) {
        category = await categories.find((item) => item.parentId == parentId);
        parentId = category?.id ? category.id : null;
        if (category) {
          categoryIds.push(category.id);
        }
      }
    }

    return categoryIds;
  },
}));
