import model_definitions from "./model_defintions";
import initORM from '../build';
import { initDB } from './provide';

export const doDataModelTest = async connectionConfig => {
	let ORM = initORM(connectionConfig);

	class Cat extends ORM.Model {static get model_definition() {return model_definitions.Cat;}}
	class CatWithPk extends ORM.Model {static get model_definition() {return {...model_definitions.Cat, pk: "primary_key"};}}

	ORM.registerModel(Cat);

	try {
		await initDB(ORM);
	} catch(err) {
		console.log(err);
	}

	describe(`Connection type ${connectionConfig.client}`, () => {
		test("it returns primary key if configured", () => {
			expect(CatWithPk._pk()).toEqual("primary_key");
		});
		test("the primary key defaults to ID when not configured", () => {
			expect(Cat._pk()).toEqual("id");
		});
		test("it returns the table name", () => {
			expect(Cat._table()).toEqual("cat");
		});
		test("it returns the id 1", () => {
			let cat = new Cat();
			expect(cat._id()).toEqual(undefined);
		});
		test("it returns the id 2", () => {
			let cat = new Cat();
			cat[Cat._pk()] = 2;
			expect(cat._id()).toEqual(2);
		});
		// test("saves an instance", async () => {
		// 	let cat = new Cat();
		// 	await cat.save();
		// 	expect(cat._id()).toEqual(1);
		// });
	});
}
