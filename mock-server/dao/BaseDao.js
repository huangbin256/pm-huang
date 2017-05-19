'use strict';
const fs = require('fs-extra-plus');
const path = require('path');
var dataPath = "../../../data/";

class BaseDao{

	constructor(entity){
		this._entity = entity;
		this._seq = 1;
	}

	async get(key){
		var data = await getJsonData.call(this);
		return data[key];
	}

	// create an entity, and return id.
	async create(dataEntity){
		var data = await getJsonData.call(this);
		var entity = Object.assign({}, dataEntity);
		entity["id"] = getSeq.call(this);
		data[entity.id] = entity;
		await setJsonData.call(this, data);
		return entity.id;
	}

	async update(id, dataEntity){
		var entity = null;
		if(id){
			var data = await getJsonData.call(this);
			if(data[id]){
				entity = Object.assign({id: id}, data[id], dataEntity);
				data[id] = entity;
				setJsonData.call(this, data);
			}
		}
		return entity;
	}

	async delete(key){
		if(key){
			var data = await getJsonData.call(this);
			if(data[key]){
				delete data[key];
				await setJsonData.call(this, data);
			}
		}
	}

	async list(){
		var data = await getJsonData.call(this);
		var arr = [];
		for(let id in data){
			arr.push(data[id]);
		}
		return arr;
	}
}

// --------- BaseDao Utilities --------- //

function getSeq(){
	return this._seq++;
}

async function getJsonData(){
	var jsonObject = {};
	try{
		let data = await fs.readFile(getJsonFile.call(this), 'utf8');
		jsonObject = JSON.parse(data);
	}catch(e){
	}
	return jsonObject;
}

async function setJsonData(jsonObject){
	let jsonData = JSON.stringify(jsonObject);
	var file = getJsonFile.call(this);
	await fs.writeFile(file, jsonData, "utf8");
}

function getJsonFile(){
	var filePath = path.join(__dirname, dataPath);
	fs.ensureDirSync(filePath);
	return path.join(__dirname, dataPath + "data-" + this._entity + ".json");
}

// --------- /BaseDao Utilities --------- //

module.exports = BaseDao;

