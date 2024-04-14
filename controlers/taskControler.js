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

            const dataCreate = new Date();
            const task = await Task.create(
                { 
                    id, 
                    user_id, 
                    title, 
                    description, 
                    timer: 0,
                    dataCreate: dataCreate, 
                    dataExpiration, 
                    deadline, 
                    collumn: 1, 
                    positionCollumn: taskInCollumn[taskInCollumn.length - 1].positionCollumn + 1,
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

        const tasks = await Task.findAll({
            where: { user_id },
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

        recountIndexPositionInCollumn(tasksInCollumn);
        
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
                        !!newCollumn && newCollumn.length != 0 &&
                        !!newPositionCollumn && newPositionCollumn.length != 0
                    ) {
                        let _currentCollumn = task.collumn;
                        let _tasksInCollumn = [];

                        if (task.collumn !== newCollumn) {
                            _currentCollumn = newCollumn;
                            task.collumn = newCollumn;
                            await task.save();
                        }
                        _tasksInCollumn = await Task.findAll({
                            where: { 
                                user_id, 
                                collumn: _currentCollumn, 
                            },
                            order: [
                                ['positionCollumn', 'ASC']
                            ],
                        });
                        if (newPositionCollumn <= 0) {
                            newPositionCollumn = 1;
                        }
                        if (_tasksInCollumn.length < newPositionCollumn) {
                            newPositionCollumn = _tasksInCollumn.length + 1;
                        }

                        recountIndexPositionInCollumn(swapElementsInCollumn(_tasksInCollumn, task, newPositionCollumn));
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

async function recountIndexPositionInCollumn(arr) { 
    if (!arr) return; 

    for (let i = 0; i < arr.length; i++) {
        let el = arr[i];

        el.positionCollumn = i + 1;
        await el.save();
    }
};

function swapElementsInCollumn(arr, elem, position) {
    if(!arr || !elem || !position) return;

    let leftElements = [];
    let rigthElements = [];

    if (position <= 1) {
        rigthElements = arr;
    } else {
        leftElements = arr.slice(0, position);
        leftElements = leftElements.filter(el => el.id !== elem.id);
        rigthElements = arr.slice(position);
    }
    rigthElements = rigthElements.filter(el => el.id !== elem.id);

    return [...leftElements, elem, ...rigthElements];
};

module.exports = new TaskControler();
