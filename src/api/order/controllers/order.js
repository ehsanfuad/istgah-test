"use strict";

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async makeRequest(ctx, next) {
    //userid va products haro begiram
    const { products, userId, selectedAddress } = ctx.request.body;
    //check kardane gheimat mahsulat

    //bedast avvordane gheimate nahai
    // const cartPrice = await strapi
    //   .service("api::order.order")
    //   .getPrice(products);
    const cartPrice = 100000;
    console.log("STATE-1:", cartPrice);
    //send request to zarin pal baraie daryafte authority
    const authorityObj = await strapi
      .service("api::order.order")
      .getAuthority(cartPrice, "افزایش اعتبار کاربر شماره ۱۱۳۴۶۲۹");
    console.log("STATE-2:", authorityObj);
    //sakhte linke pardakht
    const paymentLink = await strapi
      .service("api::order.order")
      .makePaymentLink(authorityObj);
    console.log("STATE-3:", paymentLink);
    //joda kardane authoritu code az object va check kardan
    const authority = await strapi
      .service("api::order.order")
      .getAuthorityCode(authorityObj);
    console.log("STATE-4:", authority);
    //ie order besazim (userId,products,stateOrder,price,Authority)-InvoiceNumber
    const order = await strapi
      .service("api::order.order")
      .createOrder(userId, products, cartPrice, authority, selectedAddress);
    //send paymeny link to client
    console.log("STATE-5:", order);
    return paymentLink;
  },
  async checkPayment(ctx, next) {
    //get athority and status code
    const { authority, status } = ctx.request.body;
    console.log("STATE-1:", status);
    //if payment status === "OK"
    if (status === "OK") {
      //get order price
      const order = await strapi.db.query("api::order.order").findOne({
        where: { authority },
        select: ["price"],
      });
      console.log("STATE-2:", order.price);
      // verify payment
      const verifyObj = await strapi
        .service("api::order.order")
        .verifyPayment(order.price, authority);
      console.log("STATE-3:", verifyObj);
      //if code 100 yani in order tahala verify nashode
      if (verifyObj.data.code === 100) {
        //update order with InvoiceNumber
        const invoiceNumber = verifyObj.data.ref_id;
        console.log("STATE-4:", invoiceNumber);
        try {
          const updatedOrder = await strapi.db
            .query("api::order.order")
            .update({
              where: { authority },
              data: {
                invoiceNumber,
                stateOrder: "completed",
              },
            });
          console.log("STATE-5:", updatedOrder);
          return updatedOrder;
        } catch (error) {
          console.log("STATE-6:ERROR", error);
          return error;
        }
      } else {
        //if code 101 yani in order ghablan verify shode
        return { message: "تراکنش تکراری" };
      }
    } else {
      //if "NOK" send message tarakonesh na moafagh
      return { message: "پرداخت ناموفق" };
    }
  },
}));
