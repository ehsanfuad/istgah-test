module.exports = {
  routes: [
    {
      method: "GET",
      path: "/product/getAll/:categoryId",
      handler: "product.getAll",
    },
    {
      method: "GET",
      path: "/product/getProduct/:productId",
      handler: "product.getProduct",
    },
  ],
};
