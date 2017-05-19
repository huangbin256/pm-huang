'use strict';
var BaseDao = require("./BaseDao.js");

module.exports = {
	BaseDao: BaseDao,
	todo: new BaseDao("Todo")
};