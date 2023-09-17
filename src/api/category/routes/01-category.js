module.exports = {
  routes: [
    {
      method: "GET",
      path: "/category/getAll",
      handler: "category.getAll",
    },
    {
      method: "GET",
      path: "/category/getParents/:categoryId",
      handler: "category.getParents",
    },
    {
      method: "GET",
      path: "/category/getChildren/:categoryId",
      handler: "category.getChildren",
    },
  ],
};
