"use strict";

/**
 * product service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::product.product", ({ strapi }) => ({
  getFeatureList: async (features) => {
    let list = [];
    let item = {};
    let value = "";
    let key = {};
    if (features) {
      await Promise.all(
        features.map(async (featureList) => {
          key = featureList.features.find((feature) => feature.parentId == 0);
          item["key"] = key.name;
          featureList.features.map(async (feature) => {
            if (feature.parentId != 0) {
              value = value + feature.name + " ,";
            }
          });
          item["value"] = value.slice(0, -2);
          list.push(item);
          item = {};
          key = {};
          value = "";
        })
      );
    }

    return list;
  },
  getDynamicList: async (dynamicList, dynamicName) => {
    let list = [];
    let dynamic = {};
    if (dynamicList) {
      await Promise.all(
        dynamicList.map(async (item) => {
          dynamic["id"] = item.id;
          dynamic["price"] = item.price;
          dynamic["discountedPrice"] = item.discountedPrice;
          dynamic["name"] = item[dynamicName].name;
          dynamicName == "color"
            ? (dynamic["value"] = item[dynamicName].value)
            : null;
          list.push(dynamic);
          dynamic = {};
        })
      );
    }
    return list;
  },
  getStaticList: async (staticList) => {
    let list = [];
    let staticItem = {};
    if (staticList) {
      await Promise.all(
        staticList.map(async (item) => {
          staticItem["id"] = item.id;
          staticItem["name"] = item.name;
          list.push(staticItem);
          staticItem = {};
        })
      );
    }
    return list;
  },
  sanatizedImage: async (images, flag) => {
    let list = [];
    let image = {};
    if (images) {
      await Promise.all(
        images.map(async (item) => {
          image["orginal"] = item?.url;
          image["small"] = item?.formats?.small?.url;
          image["thumbnail"] = item?.formats?.thumbnail?.url;
          list.push(image);
          image = {};
        })
      );
    }

    if (flag.imgArray) {
      return list;
    } else {
      return list[0];
    }
  },
}));
