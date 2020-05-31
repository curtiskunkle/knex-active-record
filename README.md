# knex-active-record

A tiny active record ORM layer built on top of knex.js

### Installation
`npm i knex-active-record`

### Getting Started
Create a `Store` by passing knex into `CreateStore` or pass in a knex configuration .  The store represents a connection to a datastore.  This library supports any dialect supported by knex.js.
```
import CreateStore from 'knex-active-record';

const Store = CreateStore(require('knex')({
	client: 'mysql2',
	connection: {
	    host : 'localhost',
	    port: 3306,
	    user : 'user',
	    password : '',
	    database : 'test'
	},
}));

or 

const Store = CreateStore({
	client: 'mysql2',
	connection: {
	    host : 'localhost',
	    port: 3306,
	    user : 'user',
	    password : '',
	    database : 'test'
	},
});
```
Define a `Model` and register it to the `Store` by extending `Store.Model` and passing it to `Store.registerModel`.  Models represent tables in the datastore, and instances of models represent rows in those tables.
```
class Cat extends Store.Model {
	static get model_definition() {
		return {
			table: "cat",
			attributes: {
				id: {},
				name: {},
				breed: {},
			},
		};
	}
}
Store.registerModel(Cat);
```
### Saving model instances
```
//save a cat
let cat = new Cat();
cat.name = "Ringo";
cat.breed = "Shorthair";
await cat.save();

//update the cat
cat.breed = "Bombay";
await cat.save();

//save several cats
let cat1 = new Cat();
let cat2 = new Cat();
let cat3 = new Cat();
await Store.saveAll(cat1, cat2, cat3);
```
### Deleting model instances
```
//delete the first of several cats from above
await cat1.delete();

//delete the rest
await Store.deleteAll(cat2, cat3);
```
### Querying
All find methods return knex builders, so the same syntax you would use to build a query in knex can be used to build a query using a find method. Resolving the returned builder from a find method runs the builder's query against the datastore, fetches the results, and returns model instances. It is important to note that this library uses the `postProcessResponse` feature of knex to turn query results into model instances, so you cannot use this feature in tandem with this library.
```
//find by pk
await Cat.findByP(1);

//find one cat
await Cat.findOne().where({name: "Ringo"});

//find cats
await Cat.find().where({breed: "Shorthair"});
```
### Model Definition
Model classes must extend Store.Model and have a model_defintion getter.  The model_definition getter must return an object containing a table property (the table it corresponds to in the store) and an attributes object the keys of which correspond to columns in the table.  The values of the attributes object can optionally be objects that contain further definition that defines the ORM's behavior when fetching instances.  If the attribute's object contains the `required` flag, an error will be thrown when an instance is saved if the attribute is empty.
