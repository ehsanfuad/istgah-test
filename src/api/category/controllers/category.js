"use strict";

/**
 * category controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::category.category",
  ({ strapi }) => ({
    getAll: async (ctx, next) => {
      const categories = await strapi.entityService.findMany(
        "api::category.category",
        {
          populate: ["image", "parentImage"],
        }
      );
      const categoryList = await strapi
        .service("api::category.category")
        .makeCategoryList(categories);
      return categoryList;
    },
    getParents: async (ctx, next) => {
      let categoryId = await ctx.params.categoryId;
      const categories = await strapi.entityService.findMany(
        "api::category.category"
      );
      let parentList = [];
      // console.log(categories);
      if (categories) {
        while (categoryId != null) {
          let category = await categories.find((item) => item.id == categoryId);
          parentList.push(category);
          categoryId = category?.parentId ? category?.parentId : null;
        }
      }
      return parentList.sort((a, b) => a.id - b.id).slice(0, -1);
    },
    getChildren: async (ctx, next) => {
      let categoryId = await ctx.params.categoryId;
      let childernList = [];
      const categories = await strapi.entityService.findMany(
        "api::category.category",
        {
          populate: ["image", "parentImage"],
        }
      );
      let category = await categories.find((item) => item.id == categoryId);
      if (category) {
        let parentId = category.id;
        while (parentId != null) {
          console.log(parentId);
          category = await categories.find((item) => item.parentId == parentId);
          parentId = category?.id ? category.id : null;
          if (category) {
            childernList.push(category);
          }
        }
      }

      return childernList;
    },
  })
);
