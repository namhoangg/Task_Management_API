const Task = require("../models/task.model");
const paginatonHelper = require("../helpers/pagination.helper");
const searchHelper = require("../helpers/search.helper");
const { list } = require("./user.controller");
// [GET] /api/v1/tasks
module.exports.index = async (req, res) => {
  try {
    const find = {
      $or: [
        {
          createBy: req.user.id,
        },
        { listUsers: req.user.id },
      ],
      deleted: false,
    };
    if (req.query.status) {
      find.status = req.query.status;
    }
    //Search
    searchHelper.search(req.query, find);
    //Pagination
    const countTasks = await Task.countDocuments(find);
    let objectPagination = paginatonHelper(
      {
        currentPage: 1,
        limit: 4,
        totalRow: countTasks,
        totalPage: Math.ceil(countTasks / 4),
      },
      req.query,
      countTasks
    );
    //End Pagination
    //Sort
    const sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    }
    //End sort

    const tasks = await Task.find(find)
      .sort(sort)
      .skip(objectPagination.skip)
      .limit(objectPagination.limit);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// [GET] /api/v1/tasks/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const tasks = await Task.find({
      deleted: false,
      _id: req.params.id,
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// [PATCH] /api/v1/tasks/change-status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const task = await Task.findOne({ _id: id, deleted: false });
    if (!task) {
      return res.status(404).json({ code: 404, message: "Task not found" });
    }
    task.status = req.body.status;
    await task.save();
    res.status(200).json({
      code: 200,
      message: "Cập nhật trạng thái thành công!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// [PATCH] /api/v1/tasks/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    console.log(req.body);
    const { ids, key, value } = req.body;
    console.log(key);
    switch (key) {
      case "status":
        console.log(ids, value);
        await Task.updateMany(
          {
            _id: { $in: ids },
          },
          { status: value }
        );
        break;
      case "delete":
        await Task.updateMany(
          {
            _id: { $in: ids },
          },
          { deleted: true }
        );
        break;
      default:
        break;
    }
    res.status(200).json({
      code: 200,
      message: "Cập nhật trạng thái thành công!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// [POST] /api/v1/tasks/create
module.exports.create = async (req, res) => {
  try {
    const taskBody = {
      title: req.body.title,
      status: req.body.status,
      content: req.body.content,
      timeStart: req.body.timeStart,
      timeFinish: req.body.timeFinish,
      createdBy: req.user.id,
      listUsers: req.body.listUsers,
    };
    if (req.body.taskParentId) {
      const taskParent = await Task.findOne({
        _id: req.body.taskParentId,
        deleted: false,
      });
      if (!taskParent) {
        return res
          .status(404)
          .json({ code: 404, message: "Task parent not found" });
      } else {
        taskBody.taskParentId = req.body.taskParentId;
      }
    }
    const task = new Task(taskBody);
    const data = await task.save();
    res.status(200).json({
      code: 200,
      message: "Tạo mới task thành công!",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// [PATCH] /api/v1/tasks/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const editObject = {};
    if (req.body.title) {
      editObject.title = req.body.title;
    }
    if (req.body.status) {
      editObject.status = req.body.status;
    }
    if (req.body.timeStart) {
      editObject.timeStart = req.body.timeStart;
    }
    if (req.body.timeFinish) {
      editObject.timeFinish = req.body.timeFinish;
    }
    await Task.updateOne({ _id: id }, editObject);
    res.status(200).json({
      code: 200,
      message: "Cập nhật task thành công!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// [DELETE] /api/v1/tasks/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Task.updateOne({ _id: id }, { deleted: true });
    res.status(200).json({
      code: 200,
      message: "Xóa task thành công!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
