import model_definitions from "./model_defintions";
import initORM from '../src';
import assert from 'assert';
import { initDB } from './provide';
import conns from './connections.js';

const ORM = initORM(conns.mysql2);
class Cat extends ORM.Model {static get model_definition() {return model_definitions.Cat;}}
class CatToy extends ORM.Model {static get model_definition() {return model_definitions.CatToy;}}
class Collar extends ORM.Model {static get model_definition() {return model_definitions.Collar;}}
class Leash extends ORM.Model {static get model_definition() {return model_definitions.Leash;}}
class PetOwner extends ORM.Model {static get model_definition() {return model_definitions.PetOwner;}}
class Tag extends ORM.Model {static get model_definition() {return model_definitions.Tag;}}

let cats = [];
for(let i = 0; i < 200; i++) {
	let cat = new Cat();
	cat.name = "cat" + i;
	cats.push(cat);
}

async function runTest() {
	// await initDB(ORM);
	// await Cat.batchCreate(cats);
	// console.log(await Cat.count().groupBy('id'))
	let cat = new Cat();
	await cat.save();
	await cat.save();
	process.exit();
}

try {
runTest();
}catch(err) {
	console.log(err);
	process.exit();
}

