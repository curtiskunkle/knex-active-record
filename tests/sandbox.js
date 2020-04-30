import model_definitions from "./model_defintions";
import initORM from '../src';
import assert from 'assert';
import { initDB, populateDB } from './provide';
import conns from './connections.js';

const ORM = initORM(conns.mysql2);
class Cat extends ORM.Model {static get model_definition() {return model_definitions.Cat;}}
class CatToy extends ORM.Model {static get model_definition() {return model_definitions.CatToy;}}
class Collar extends ORM.Model {static get model_definition() {return model_definitions.Collar;}}
class Leash extends ORM.Model {static get model_definition() {return model_definitions.Leash;}}
class PetOwner extends ORM.Model {static get model_definition() {return model_definitions.PetOwner;}}
class Tag extends ORM.Model {static get model_definition() {return model_definitions.Tag;}}

ORM.registerModel(Cat);
ORM.registerModel(CatToy);
ORM.registerModel(Collar);
ORM.registerModel(Leash);
ORM.registerModel(PetOwner);
ORM.registerModel(Tag);

async function runTest() {
	await initDB(ORM);
	await populateDB(ORM);
	let cat = await Cat.findOne();
	console.log(await cat.catToys());
	process.exit();
}

try {
runTest();
}catch(err) {
	console.log(err);
	process.exit();
}
