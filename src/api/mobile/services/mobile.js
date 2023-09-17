"use strict";

/**
 * mobile service
 */

const axios = require("axios");
const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::mobile.mobile", ({ strapi }) => ({
  sendSms: async (mobileNumber, otp) => {
    const data = JSON.stringify({
      bodyId: 69431,
      to: mobileNumber,
      args: [otp],
    });

    const options = {
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length.toString(),
      },
    };

    const apiUrl = `https://console.melipayamak.com/api/send/shared/${process.env.SMS_API_KEY}`;

    try {
      const response = await axios.post(apiUrl, data, options);
      console.log(response.data);
      return parseInt(response.status);
    } catch (error) {
      console.error(error);
    }
  },
  register: async (mobileNumber) => {
    const callEndpoint = async () => {
      try {
        const response = await axios.post(
          `${process.env.BACKEND_URL}/api/auth/local/register`,
          {
            username: mobileNumber,
            email: mobileNumber + "@gmail.com",
            password: process.env.STATIC_PASSWORD,
          }
        );
        return response.data;
      } catch (error) {
        console.error("Error:", error);
      }
    };
    const result = await callEndpoint();
    return result;
  },
  login: async (mobileNumber) => {
    try {
      const response = await axios.post(
        `${process.env.BACKEND_URL}/api/auth/local`,
        {
          identifier: mobileNumber,
          password: process.env.STATIC_PASSWORD,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error:", error);
    }
  },
}));
