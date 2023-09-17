module.exports = {
  routes: [
    {
      method: "POST",
      path: "/order/makeRequest",
      handler: "order.makeRequest",
    },
    {
      method: "POST",
      path: "/order/checkPeyment",
      handler: "order.checkPayment",
    },
  ],
};
