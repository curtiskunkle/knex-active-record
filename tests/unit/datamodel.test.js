import model_definitions from "../model_defintions";
import initORM from '../../build';
import assert from 'assert';

//don't actually need to connect to do data model unit tests
let ORM = initORM({client: 'mysql2',connection: "this-is-a-test-connection-string"});

class Cat extends ORM.Model {static get model_definition() {return model_definitions.Cat;}}

//for testing defined pk
class CatWithPk extends ORM.Model {static get model_definition() {return {...model_definitions.Cat, pk: "primary_key"};}}

let catWithAttrValidationDef = JSON.parse(JSON.stringify(model_definitions.Cat)); //good ole javascript
catWithAttrValidationDef.attributes.name = {validate: name => {return name !== "spot"}};
class CatWithAttributeValidation extends ORM.Model {static get model_definition() {return catWithAttrValidationDef;}}

ORM.registerModel(Cat);

//@TODO test constructor,
//constructing attributes,
//transform functions
//validate functions
//transforming query results,
//debug func
//applying relationships,

describe(`Datamodel unit tests`, () => {
	it("it returns primary key if configured", () => {
		assert.equal(CatWithPk._pk(), "primary_key");

	});
	it("the primary key defaults to ID when not configured", () => {
		assert.equal(Cat._pk(), "id");
	});
	it("it returns the table name", () => {
		assert.equal(Cat._table(), "cat");
	});
	it("it returns the id undefined", () => {
		let cat = new Cat();
		assert.equal(cat._id(), undefined);
	});
	it("it returns the id 2", () => {
		let cat = new Cat();
		cat[Cat._pk()] = 2;
		assert.equal(cat._id(), 2);
	});
	it("it can validate", () => {
		let cat = new Cat();
		assert.equal(cat.validate(), true);
	});
	it("it can transform", () => {
		let cat = new Cat();
		assert.equal(cat.transform(), true);
	});
	it("it generates table.field string", () => {
		assert.equal(Cat.attr("column_name"), 'cat.column_name');
	});
});
