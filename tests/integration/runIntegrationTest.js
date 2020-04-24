import model_definitions from "../model_defintions";
import initORM from '../../build';
import assert from 'assert';
import { initDB } from '../provide';

export default async connectionConfig => {
	let ORM = initORM(connectionConfig);
	class Cat extends ORM.Model {static get model_definition() {return model_definitions.Cat;}}
	class CatToy extends ORM.Model {static get model_definition() {return model_definitions.CatToy;}}
	class Collar extends ORM.Model {static get model_definition() {return model_definitions.Collar;}}
	class Leash extends ORM.Model {static get model_definition() {return model_definitions.Leash;}}
	class PetOwner extends ORM.Model {static get model_definition() {return model_definitions.PetOwner;}}
	class Tag extends ORM.Model {static get model_definition() {return model_definitions.Tag;}}

	class InvalidTable extends ORM.Model {static get model_definition() {return {...model_definitions.Tag, table: "invalid_table"};}}

	[
		Cat,
		CatToy,
		Collar,
		Leash,
		PetOwner,
		Tag,
	].map(modelClass => {
		ORM.registerModel(modelClass);
	})

	describe(`Integration test ${connectionConfig.client}`, () => {

		it("testing connection...", async () => {
			await ORM.knex.raw('select 1 + 1 as result');
		});

		it("it initializes DB", async () => {
			await initDB(ORM);
		});

		it("it saves a new record", async () => {
			let cat = new Cat();
			await ORM.knex.truncate(Cat._table());
			await cat.save();
			assert.notEqual(cat._id(), undefined);
		});

		it("it deletes a record", async () => {
			let cat = new Cat();
			cat.name = "spot";
			await ORM.knex.truncate(Cat._table());
			await cat.save();
			assert.equal((await Cat.find()).length, 1);
			await cat.delete();
			assert.equal((await Cat.find()).length, 0);
		});

		it("it updates a record", async () => {
			let cat = new Cat();
			cat.name = "spot";
			await ORM.knex.truncate(Cat._table());
			await cat.save();
			cat.name = "fluffy";
			await cat.save();
			assert.equal((await Cat.findOne()).name, "fluffy");
		});

		it("it throws an error on invalid query", async () => {
			let invalid = new InvalidTable();
			await ORM.knex.truncate(Cat._table());
			assert.rejects(invalid.save());
		});

		it("it selects one", async () => {
			let cat1 = new Cat(); let cat2 = new Cat(); let cat3 = new Cat();
			await ORM.knex.truncate(Cat._table());
			await cat1.save(); await cat2.save(); await cat3.save();
			let theCat = await Cat.findOne();
			assert.equal(theCat._id(), 1);
		});

		it("it selects by pk", async () => {
			let cat1 = new Cat(); let cat2 = new Cat(); let cat3 = new Cat();
			await ORM.knex.truncate(Cat._table());
			await cat1.save(); await cat2.save(); await cat3.save();
			let theCat = await Cat.findByPk(2);
			assert.equal(theCat._id(), 2);
		});

		it("it selects all", async () => {
			let cat1 = new Cat(); let cat2 = new Cat(); let cat3 = new Cat();
			await ORM.knex.truncate(Cat._table());
			await cat1.save(); await cat2.save(); await cat3.save();
			assert.equal((await Cat.find()).length, 3);
		});

		it("it selects where", async () => {
			let cat1 = new Cat(); let cat2 = new Cat(); let cat3 = new Cat();
			cat1.name = "spot"; cat2.name = "spot";
			await ORM.knex.truncate(Cat._table());
			await cat1.save(); await cat2.save(); await cat3.save();
			let cats = await Cat.find().where({name: "spot"});
			assert.equal(cats.length, 2);
			cats.map(c => {
				assert.equal(c.name, "spot");
			});
		});

		//@TODO test fetching relationships

		//necessary because the test will hang if the connection is left open
		it("closing connection...", async () => {
			await ORM.knex.destroy();
		});
	});
}
