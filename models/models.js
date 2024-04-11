const sequelize = require('../db')
const { DataTypes } = require('sequelize');``

const User = sequelize.define('user', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement:true },
      name: { type: DataTypes.STRING },
      password: { type: DataTypes.STRING },
      userMail: { type: DataTypes.STRING },
      dataCreate: { type: DataTypes.DATE },
});
const Task = sequelize.define('task', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement:true },
      user_id: { type: DataTypes.INTEGER },
      title: { type: DataTypes.STRING },
      description: { type: DataTypes.STRING },
      timer: { type:  DataTypes.INTEGER },
      dataCreate: { type: DataTypes.DATE },
      dataExpiration: { type: DataTypes.DATE || DataTypes.STRING },
      deadline: { type: DataTypes.DATE },
      collumn: { type: DataTypes.INTEGER },
      positionCollumn: { type: DataTypes.INTEGER },
});
const taskCommetns = sequelize.define('comments', {
   id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement:true },
   task_id: { type: DataTypes.INTEGER },
   description: { type: DataTypes.STRING },
   dataCreate: { type: DataTypes.DATE },
   autor: { type: DataTypes.INTEGER },
});

User.hasMany(Task, { as: 'task', foreignKey: 'user_id' });//при удалении user удаляються и tasks
Task.hasMany(taskCommetns, { as: 'comments', foreignKey: 'task_id' });

module.exports = {
   User,
   Task,
   taskCommetns
};