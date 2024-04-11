const Router = require('express');
const userControler = require('../controlers/userControler.js');
const taskController = require('../controlers/taskControler.js');
const commentsControler = require('../controlers/commentsControler.js');
const router = new Router();
const { body } = require('express-validator');

//user
router.post('/', [
                  body("name", "Имя не должно быть пустым").notEmpty(),
                  body("password", "Пароль не должен быть пустым").notEmpty(),
               ], userControler.createUser);
router.get('/', userControler.userAuthorization);
router.delete('/', userControler.userDelite);
router.put('/', [
                  body("newName", "Имя не должно быть пустым").notEmpty(),
                  body("newPassword", "Пароль не должен быть пустым").notEmpty(),
               ], userControler.changeUser);

//task
router.post('/task', taskController.createTask);
router.get('/task/:id', taskController.getOneTask);
router.get('/task', taskController.getAllTasks);
router.put('/task/:id', taskController.changeTask);
router.delete('/task/:id', taskController.taskDelete);

//comments
router.post('/task/:taskId/comments', commentsControler.createComment);
router.put('/task/:taskId/comments', commentsControler.changeComment);
router.delete('/task/:taskId/comments', commentsControler.deleteComment);

module.exports = router;