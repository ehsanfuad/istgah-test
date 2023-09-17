"use strict";

/**
 * order service
 */

const axios = require("axios");
const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::order.order", ({ strapi }) => ({
  async getAuthority(amount, description) {
    const headers = {
      accept: "application/json",
      "content-type": "application/json",
    };
    const params = {
      merchant_id: "24a79a94-815c-11e9-8c4e-000c29344814",
      amount,
      callback_url: "http://localhost:3000/invoice",
      description,
    };
    try {
      const response = await axios.post(
        "https://api.zarinpal.com/pg/v4/payment/request.json",
        params,
        headers
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  async makePaymentLink(authorityObj) {
    if (authorityObj.data.code === 100) {
      const authority = authorityObj.data.authority;
      const paymentLink = `https://www.zarinpal.com/pg/StartPay/${authority}`;
      return paymentLink;
    }
  },
  async verifyPayment(amount, authority) {
    const headers = {
      accept: "application/json",
      "content-type": "application/json",
    };
    const params = {
      merchant_id: "24a79a94-815c-11e9-8c4e-000c29344814",
      amount: 100000,
      authority: "A00000000000000000000000000461374702",
    };
    try {
      const response = await axios.post(
        "https://api.zarinpal.com/pg/v4/payment/verify.json",
        params,
        headers
      );
      console.log("verify response", response);
      return response;
    } catch (error) {
      console.log("ERROR", error.statusCode);
      // return error;
    }
  },
  async getPrice(products) {
    let price = 0;
    await Promise.all(
      products.map(async (product) => {
        price = price + product.quantity * product.price;
      })
    );
    return price;
  },
  async getAuthorityCode(authorityObj) {
    if (authorityObj.data.code === 100) {
      const authority = authorityObj.data.authority;
      return authority;
    } else {
      return "error";
    }
  },
  async createOrder(userId, products, price, authority, selectedAddress) {
    if (authority != "error") {
      let orderData = {
        data: {
          userId,
          products,
          stateOrder: "process",
          price,
          authority,
          addressId: selectedAddress,
          publishedAt: new Date(),
        },
      };
      try {
        let order = await strapi.entityService.create(
          "api::order.order",
          orderData
        );
        return order;
      } catch (error) {
        console.log(error);
      }
    } else {
      return "error create order";
    }
  },
}));
