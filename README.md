# knex-active-record

A tiny active record ORM layer built on top of knex.js

### Installation
`npm i knex-active-record`

### Getting Started
Create a `Store` 
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
```
Define a `Model` and register it to the `Store`
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
All find methods return knex builders, so you can use knex methods to build out a query for finding models.  It is important to note that this library uses the `postProcessResponse` feature of knex to turn query results into model instances,so you cannot use this feature in tandem with this library.
```
//find by pk
await Cat.findByP(1);

//find one cat
await Cat.findOne().where({name: "Ringo"});

//find cats
await Cat.find().where({breed: "Shorthair"});
```
