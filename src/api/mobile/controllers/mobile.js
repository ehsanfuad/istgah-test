"use strict";

/**
 * mobile controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
function generateOtp(date1, date2) {
  const timeDifference = Math.abs(date1 - date2); // Get the time difference in milliseconds
  const threeMinutesInMilliseconds = 3 * 60 * 1000; // 3 minutes in milliseconds
  console.log("timeDifference", timeDifference);
  if (timeDifference < threeMinutesInMilliseconds) {
    return false;
  } else {
    return true;
  }
}
module.exports = createCoreController("api::mobile.mobile", ({ strapi }) => ({
  getMobile: async (ctx, next) => {
    //get mobile number from client
    const mobileNumber = ctx.request.body.data.mobileNumber;
    //get current date
    const currentDate = new Date();
    //define otp object
    let otpObject;
    //define mobile entry
    let mobileEntry;
    //make otp code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    //search mobile number in users
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { username: mobileNumber },
      });
    //if user exist
    if (user) {
      //get otp object
      otpObject = user?.otp;
      //if otp object exist
      if (otpObject) {
        //get otp date
        const otpDate = new Date(otpObject.date);
        //check time that can generate new otp
        const canGenerateOtp = generateOtp(currentDate, otpDate);
        if (canGenerateOtp) {
          //send otp sms to user
          const statusCode = await strapi
            .service("api::mobile.mobile")
            .sendSms(mobileNumber, code);
          //if status sms service 200
          if (statusCode >= 200 || statusCode < 300) {
            //update otp object
            otpObject = {
              code,
              date: currentDate,
            };
            //update user with otp object
            const updatedUser = await strapi.db
              .query("plugin::users-permissions.user")
              .update({
                where: { username: mobileNumber },
                data: {
                  otp: otpObject,
                },
              });
            //make user data
            const userData = {
              jwt: updatedUser.jwt,
              user: { username: updatedUser.username },
            };
            //send user data to client
            return userData;
          }
        } else {
          //if less than 3 minutes return left time to user
          return "left time";
        }
        //else otp object dosent exist
      } else {
        //send otp sms to user
        const statusCode = await strapi
          .service("api::mobile.mobile")
          .sendSms(mobileNumber, code);
        //if status sms service 200
        if (statusCode >= 200 || statusCode < 300) {
          //make otp object
          otpObject = {
            code,
            date: currentDate,
          };
          //update user with otp object
          const updatedUser = await strapi.db
            .query("plugin::users-permissions.user")
            .update({
              where: { username: mobileNumber },
              data: {
                otp: otpObject,
              },
            });
          console.log("updatedUser", updatedUser);
          //make user data
          const userData = {
            jwt: updatedUser.jwt,
            user: { username: updatedUser.user.username },
          };
          //send user data to client
          return userData;
        }
      }
      //else user dosent exist
    } else {
      //search mobile in mobile collection
      mobileEntry = await strapi.db.query("api::mobile.mobile").findOne({
        where: { mobile: mobileNumber },
      });
      //check if mobile dosent exist
      if (!mobileEntry) {
        //create new one with mobile
        mobileEntry = await strapi.db.query("api::mobile.mobile").create({
          data: {
            mobile: mobileNumber,
          },
        });
      }
      //get otp object
      otpObject = mobileEntry?.otp;
      //if otp object exist
      if (otpObject) {
        //get otp date
        const otpDate = new Date(otpObject.date);
        console.log("otpDate", otpDate);
        //check can genereta new otp code
        const canGenerateOtp = generateOtp(currentDate, otpDate);
        //if ok to generate
        if (canGenerateOtp) {
          //send otp sms to user
          const statusCode = await strapi
            .service("api::mobile.mobile")
            .sendSms(mobileNumber, code);
          //if status sms service 200
          if (statusCode >= 200 || statusCode < 300) {
            //update otp obj with current data object
            otpObject = {
              code,
              date: currentDate,
            };
            //update mobile with new otp object
            const updatedMobileEntry = await strapi.db
              .query("api::mobile.mobile")
              .update({
                where: { mobile: mobileNumber },
                data: {
                  otp: otpObject,
                },
              });
            return "otp has been send";
          }
          //else retuen lef time to client
        } else {
          return "left time";
        }
        // else otb obj dosent exist
      } else {
        const statusCode = await strapi
          .service("api::mobile.mobile")
          .sendSms(mobileNumber, code);
        //if status sms service 200
        if (statusCode >= 200 || statusCode < 300) {
          //update otp obj with current data object
          otpObject = {
            code,
            date: currentDate,
          };
          //update mobile with new otp object
          const updatedMobileEntry = await strapi.db
            .query("api::mobile.mobile")
            .update({
              where: { mobile: mobileNumber },
              data: {
                otp: otpObject,
              },
            });
          return "otp has been send";
        }
      }
    }
  },
  getOtp: async (ctx, next) => {
    //get otp and mobile
    const { code, mobileNumber } = ctx.request.body.data;
    //check mobile collection mobile and otp
    const mobileIsExist = await strapi.db.query("api::mobile.mobile").findOne({
      where: { mobile: mobileNumber },
    });
    //if mobile is exist mean user dosent register
    if (mobileIsExist) {
      //get otp code
      const otpCode = mobileIsExist.otp.code;
      //if code is correct register user
      if (otpCode === code) {
        //register user with mobile statick password fake email
        const user = await strapi
          .service("api::mobile.mobile")
          .register(mobileNumber);
        //delete all mobile records
        await strapi.db.query("api::mobile.mobile").deleteMany({
          where: { mobile: mobileNumber },
        });
        //send user to client
        //make user data
        const userData = {
          jwt: user.jwt,
          user: {
            username: user.user.username,
            firstName: user.user?.firstName,
            lastName: user.user?.lastName,
          },
        };
        return userData;
      }
      //user already register
    } else {
      //get user with mobile
      const foundUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { username: mobileNumber },
        });
      //check otp with user otp
      const otpCode = foundUser.otp?.code;
      if (otpCode === code) {
        //if are the same
        //login user with username(mobile) and static password
        const loginUser = await strapi
          .service("api::mobile.mobile")
          .login(mobileNumber);
        const userData = {
          jwt: loginUser.jwt,
          user: {
            username: loginUser.user.username,
            firstName: loginUser.user?.firstName,
            lastName: loginUser.user?.lastName,
          },
        };
        return userData;
      }
    }
  },
}));
