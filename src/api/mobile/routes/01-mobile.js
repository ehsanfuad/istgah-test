module.exports = {
  routes: [
    {
      method: "POST",
      path: "/mobile/getMobile", // Only match when the URL parameter is composed of lowercase letters
      handler: "mobile.getMobile",
    },
    {
      method: "POST",
      path: "/mobile/getOtp", // Only match when the URL parameter is composed of lowercase letters
      handler: "mobile.getOtp",
    },
  ],
};
