const { taskCommetns, Task } = require("../models/models");

class commentsControler {
    async createComment(req, res, next) {
        try {
            const { taskId } = req.params;

            let { id, user_id, description } = req.body;

            const task = await Task.findOne({
                where: { id: taskId, user_id },
            });

            if (task !== null) {
                const dataCreate = new Date();
                const comment = await taskCommetns.create(
                    { 
                        id, 
                        task_id: taskId,  
                        description, 
                        dataCreate: dataCreate, 
                        autor: user_id
                    });
                return res.status(200).json(comment);
            } else {
                return res.status(404).json({message: 'задача не найдена'});
            }
        } catch (e) {
            next(res.json(e));
        }
    };

    async changeComment(req, res, next) {
        try {
            const { taskId } = req.params;
    
            let { 
                id,
                newDescription
            } = req.body;
            
            const comment = await taskCommetns.findOne({
                where: { id, task_id: taskId },
            });

            if  (comment != null) {
                    if (!!newDescription && newDescription.length != 0) {
                        comment.description = newDescription;
                        await comment.save();
                    }
  
                    return res.status(200).json(comment);
            } else {
                return res.status(404).json({message: `task not found`});
            }
    
        } catch (e) {
            next(res.json(e));
        }
    };

    async deleteComment(req, res) {
        const { taskId } = req.params;
    
        let { id } = req.body;
        
        const comment = await taskCommetns.findOne({
            where: { id, task_id: taskId },
        });

        if (comment === null) {
            return res.status(401).json({message: "Комментарий не найден"});
        }

        await taskCommetns.destroy({where: { id, task_id: taskId },});
        return res.status(200).json({ message: `sucess delete comment` });
    };
}
module.exports = new commentsControler();
