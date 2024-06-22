const { Task, taskCommetns } = require("../models/models");

class TaskControler {
    async createTask(req, res, next) {
        try {
            const { 
                id,
                user_id, 
                title, 
                description,
                dataExpiration, 
                deadline
            } = req.body;
            
            let taskInCollumn = []
            taskInCollumn = await Task.findAll({
                where: { 
                    user_id, 
                    collumn: 1 
                },
            });

            const _dataCreate = new Date();
            let _positionInCollumn = 1;

            if (
                _positionInCollumn.length !== 0 && 
                typeof taskInCollumn[taskInCollumn.length - 1] !== 'undefined'
            ) {
                _positionInCollumn = taskInCollumn[taskInCollumn.length - 1].positionCollumn + 1;
            }

            const task = await Task.create(
                { 
                    id, 
                    user_id, 
                    title, 
                    description, 
                    timer: 0,
                    dataCreate: _dataCreate, 
                    dataExpiration, 
                    deadline, 
                    collumn: 1, 
                    positionCollumn: _positionInCollumn,
                });
            return res.json(task);
        } catch (e) {
            next(res.json(e));
        }
    };

    async getOneTask(req, res, next) {
        // reg.body заменено на reg.query тк у get нет тела
        // reg.body актуально для postman а для приложения req.query
        let request = req.body;
        if (request.user_id == undefined) {
            request = req.query;
        }
        const { id } = req.params;

        let { user_id } = request;

        const task = await Task.findOne({
            where: { id, user_id },
        });

        const comments = await taskCommetns.findAll({
            where: { task_id: id },
        });

        if (task == null) {
            return res.status(404).json({ message: `task not found` });
        } else {
            const total = {
                task,
                comments
            };

            return res.status(200).json(total);
        }
    };

    async getAllTasks(req, res, next) {
        // reg.body заменено на reg.query тк у get нет тела
        // reg.body актуально для postman а для приложения req.query
        let request = req.body;
        if (request.user_id == undefined) {
            request = req.query;
        }

        let { user_id } = request;

        if (!user_id) {
            return res.status(404).json({ message: `user not found` });
        }

        const tasks = await Task.findAll({
            where: { user_id },
            order: [
                ['collumn', 'ASC'],
                ['positionCollumn', 'ASC']
            ],
        });

        if (tasks == null) {
            return res.status(404).json({ message: `tasks not found` });
        } else {
            return res.status(200).json(tasks);
        }
    };

    async taskDelete(req, res) {
        let request = req.body;
        if (request.user_id == undefined) {
            request = req.query;
        }
        const { id } = req.params;

        let { user_id } = request;

        const task = await Task.findOne({
            where: { id, user_id },
        });

        if (task === null) {
            return res.status(401).json({message: "Задача не найдена"});
        }
        await Task.destroy({where: { id, user_id }});

        let tasksInCollumn = []
        tasksInCollumn = await Task.findAll({
            where: { 
                user_id, 
                collumn: task.collumn, 
            },
            order: [
                ['positionCollumn', 'ASC']
            ],
        });

        recountIndexPositionInColumn(tasksInCollumn);
        
        return res.status(200).json({ message: `sucess delete task` });
    };

    async changeTask(req, res, next) {
        try {
            let request = req.body;
            if (request.user_id == undefined) {
                request = req.query;
            }
            const { id } = req.params;

            
            let { 
                user_id, 
                newTitle,
                newDescription,
                newTimer,
                newDataExpiration,
                newDeadline,
                newCollumn,
                newPositionCollumn 
            } = request;

            const task = await Task.findOne({
                where: { id, user_id },
            });

            if  (task != null) {
                    if (!!newTitle && newTitle.length != 0) {
                    task.title = newTitle;
                    await task.save();
                    }
                    if (!!newDescription && newDescription.length != 0) {
                        task.description = newDescription;
                        await task.save();
                    }
                    if (!!newTimer && newTimer.length != 0) {
                        task.timer = newTimer;
                        await task.save();
                    }
                    if (!!newDataExpiration && newDataExpiration.length != 0) {
                        task.dataExpiration = newDataExpiration;
                        await task.save();
                    }
                    if (!!newDeadline && newDeadline.length != 0) {
                        task.deadline = newDeadline;
                        await task.save();
                    }
                    if (
                        newCollumn.length !== 0 &&
                        newPositionCollumn.length !== 0
                    ) {
                        let _currentColumn = task.collumn;
                        let _tasksInColumn = [];

                        if (task.collumn !== newCollumn) {
                            _currentColumn = newCollumn;
                            task.collumn = newCollumn;
                            await task.save();
                        }
                        _tasksInColumn = await Task.findAll({
                            where: { 
                                user_id, 
                                collumn: _currentColumn, 
                            },
                            order: [
                                ['positionCollumn', 'ASC']
                            ],
                        });
                        // if (newPositionCollumn <= 0) {
                        //     newPositionCollumn = 1;
                        // }
                        if (_tasksInColumn.length < newPositionCollumn) {
                            newPositionCollumn = _tasksInColumn.length + 1;
                        }
                        if (_tasksInColumn.length === 0) {
                            _tasksInColumn = [task];
                        }

                        let currentArr = [];
                        _tasksInColumn.forEach(el => {
                            if (el.id !== task.id) {
                                currentArr.push(el);
                            }
                        })

                        currentArr.splice(newPositionCollumn, 0, task);
                        recountIndexPositionInColumn(currentArr);
                    }  

                    return res.status(200).json({message: `element success change`});
            } else {
                return res.status(404).json({message: `task not found`});
            }

        } catch (e) {
            next(res.json(e));
        }
    };
};

async function recountIndexPositionInColumn(arr) { 
    if (!arr) return; 
    console.log('length: ', arr.length)
    for (let i = 0; i < arr.length; i++) {
        let el = arr[i];
        console.log('rec item: ',el.id)
        el.positionCollumn = i + 1;
        await el.save();
    }
};

module.exports = new TaskControler();
