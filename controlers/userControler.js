const { User } = require("../models/models");
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

class UserController {
   async createUser(req, res, next) {
      try {

         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return res.status(400).json(
               {
                  status: 400, 
                  message: "ошибки заполнения полей", 
                  errors: errors
               }
            );
         }
         
         const { id, name, password, userMail } = req.body;

         const checkUser = await User.findOne({
            where: { name },
         });
         if (checkUser === null) {
            const dataCreate = new Date();
            const hashPassword = bcrypt.hashSync(password, 7);
            const user = await User.create(
               { 
                  id, 
                  name, 
                  password: hashPassword, 
                  userMail, 
                  dataCreate: dataCreate 
               });
            return res.json(user);
         } else {
            return res.json({ message: `a user with this name already exists` });
         }
        
      } catch (e) {
         next(res.json(e));
      }
   };

   async userAuthorization(req, res, next) {
      // reg.body заменено на reg.query тк у get нет тела
      // reg.body актуально для postman а для приложения req.query
      let request = req.body;
      if (request.name == undefined && request.password == undefined) {
         request = req.query;
      }
      let { name, password } = request;

      const user = await User.findOne({
         where: { name },
      });

      if (user == null) {
         return res.json({ message: `user not found` });
      }

      bcrypt.compare(password, user.password, function(err, resp) {
         if (resp !== true) {
            return res.status(400).json(
               {
                  status: 400, 
                  message: "Не верный логин или пароль", 
               }
            );
         } else {
            return res.status(200).json(user);
         }
      });
   };

   async userDelite(req, res) {
      const { name, password } = req.body;

      const user = await User.findOne({
         where: { name },
      });

      if (user === null) {
         return res.status(401).json(
            {
               status: 401, 
               message: "Не верный логин или пароль", 
            }
         );
      }

      bcrypt.compare(password, user.password, async function(err, resp) {
         if (resp !== true) {
            return res.status(400).json(
               {
                  status: 400, 
                  message: "Не верный логин или пароль", 
               }
            );
         } else {
            await User.destroy({
               where: { name },
            });
            return res.status(200).json({ message: `sucess delete user` });
         }
      });
   };

   async changeUser(req, res, next) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return res.status(400).json(
               {
                  status: 400, 
                  message: "ошибки заполнения полей", 
                  errors: errors
               }
            );
         }
         
         const { id, name, password, newName, newPassword, newMail } = req.body;
         const user = await User.findOne({
            where: { id, name },
         });

         if (user != null) {
            bcrypt.compare(password, user.password, async function(err, resp) {
               if (resp === true) {
                     if (!!newName && newName.length != 0) {
                        user.name = newName;
                        await user.save();
                     } 
                     if (!!newPassword && newPassword.length != 0) {
                        user.password = bcrypt.hashSync(newPassword, 7);
                        await user.save();
                     }
                     if (!!newMail && newMail.length != 0) {
                        user.userMail = newMail;
                        await user.save();
                     } 
                     return res.json({
                        message: `user data has been successfully changed`,
                        code: 200,
                     });
                  }
            });
         } else {
            return res.status(400).json({message: "Не верный логин или пароль", });
         }

      } catch (e) {
         next(res.json(e));
      }
   };
}
module.exports = new UserController();
