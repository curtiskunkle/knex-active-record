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
await Cat.findByPk(1);

//find one cat
await Cat.findOne().where({name: "Ringo"});

//find cats
await Cat.find().where({breed: "Shorthair"});
```
### Model Definition
Model classes must extend Store.Model and have a model_defintion getter.  The model_definition getter must return an object containing a table property (the table it corresponds to in the store) and an attributes object the keys of which correspond to columns in the table.  The values of the attributes object can optionally be objects that contain further definition that defines the ORM's behavior when fetching instances.  If the attribute's object contains the `required` flag, an error will be thrown when an instance is saved if the attribute is empty.  If the attribute's object contains a `validate` function, an error will be thrown when attempting to save the model instance if the validate function returns false.  If the attribute's object contains a `transform` function, the returned value of the attribute will be the return value of the transform function. Finally, you cna optionally define a `pk` on the object.  If not provided, the primary key is defaulted to "id".
```
//Model example with custom pk and attribute props
class Cat extends Store.Model {
	static get model_definition() {
		return {
			pk: "id",
			table: "cat",
			attributes: {
				id: {},
				name: {
					//require name attribute
					required: true,
					//return "My name is ${name}"
					transform: (value) => "My name is " + value,
				},
				breed: {
					validate: (value) => {
						//only allow values in the array
						return ["Shorthair", "Longhair", "Bombay"].indexOf(value) !== -1;
					},
				},
			},
		};
	}
}
```
### Defining Simple Model Relationships
In addition to the model definition described above, this library supports defining model-to-model relationships.  The result of defining a relationship is a function on model instances for fetching the defined relationship. For example, to define a `hasMany` relationship from cats to cat toys:
```
//define relationship on cat class from above
class Cat extends Store.Model {
	static get model_definition() {
		return {
			...//table, attributes, etc.
			hasMany: {
				//the model corresponds to another model registed on the store
				//the key corresponds to the relationship foreign key
				catToys: {model: "CatToy", key: "cat_id"},
			},
		};
	}
}

//cat toy class 
class CatToy extends Store.Model {
	static get model_definition() {
		return {
			table: "cat_toy",
			attributes: {
				id: {},
				cat_id: {},
				name: {},
			},
		};
	}
}

//get a cat
let singleCat = await Cat.findOne();

//fetch all cat toys with cat_id = singleCat's primary key
let catToys = await singleCat.catToys();

//fetch singleCat's balls of yarn
let ballsOfYarn = await singleCat.catToys().where({name: "Ball of Yarn"});
```
The supported simple relationships are `hasMany`, `belongsTo`, and `hasOne`.  All require a a model and key prop. Calling a function created from a `hasMany` relationship returns an array of model instances while `belongsTo` and `hasOne` relationship functions return a single model instance.
### Defining Through Relationships
In addition to the simple relationships described above, this library supports defining "through" relationships.  These are relationships to models through other predefined relationships.  For example, if a pet owner has many cats, and a cat has many cat toys, then the relationship of pet owners to cat toys could be described as "Pet owners have many cat toys through cats".  Defining this type of relationship will yield a function on pet owners that fetches all of the cat toys with cat_ids that correspond to all of the pet owner's cats.
```
//has many through example
class PetOwner extends Store.Model {
	static get model_definition() {
		return {
			table: "pet_owner",
			attributes: {
				id: {},
				name: {},
			},
			hasMany: {
				cats: {model: "Cat", key: "pet_owner_id"},
			},
			hasManyThrough: {
				//through corresponds to a defined relationship on this model defintion
				//relationship corresponds to a defined relationship on the through model
				catToys: {through: 'cats', relationship: "catToys"},
			}
		};
	}
}

class Cat extends Store.Model {
	static get model_definition() {
		return {
			table: "cat",
			attributes: {
				id: {},
				name: {},
				pet_owner_id: {},
			},
			hasMany: {
				catToys: {model: "CatToy", key: "cat_id"},
			},
		};
	}
}


class CatToy extends Store.Model {
	static get model_definition() {
		return return {
			table: "cat_toy",
			attributes: {
				id: {},
				cat_id: {},
				name: {},
			},
		};
	}
}

//get a pet owner
let petowner = await PetOwner.findOne();

//fetch all of this pet owner's cats' cat toys
let petOwnersCatToys = await PetOwner.catToys();
```
The supported through relationship types are `hasManyThrough`, `hasOneThrough`, and `belongsToThrough`.
