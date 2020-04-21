import initORM from '../src/index';

let ORM = initORM({
	client: 'mysql2',
	connection: {
	    host : 'localhost',
	    port: 3306,
	    user : 'root',
	    password : 'password123',
	    database : 'test'
	  }
});

const trans = data => {
	return "My name is " + data;
}

class PetOwner extends ORM.Model {
	constructor() {
		super();
		this.aTestProperty = "this is a test";
	}
	static get model_definition() {
		return {
			table: "pet_owner",
			attributes: {
				id: null,
				name: {
					transform: trans,
					required: true
				},
			},
			hasMany: {
				cats: {model: "Cat", key: "pet_owner_id"},
			},
			hasManyThrough: {
				catToys: {through: 'cats', relationship: "catToys"},
			}
		}
	};

	transform() {
		this.name = "this is a test transform";
	}
}

class Cat extends ORM.Model {
	static get model_definition() {
		return {
			table: "cat",
			attributes: {
				id: {},
				pet_owner_id: {},
				name: {},
				breed: {},
			},
			belongsTo: {
				owner: {model: "PetOwner", key: "pet_owner_id"}
			},
			hasMany: {
				catToys: {model: "CatToy", key: "cat_id"},
			},
			hasOne: {
				collor: {model: "Collar", key: "cat_id"},
			}
		}
	};
}

class Collar extends ORM.Model {
	static get model_definition() {
		return {
			table: "collar",
			attributes: {
				id: {},
				cat_id: {},
				color: {},
			},
			belongsTo: {
				cat: {model: "Cat", key: "cat_id"},
			}
		}
	};
}

class CatToy extends ORM.Model {
	static get model_definition() {
		return {
			table: "cat_toy",
			attributes: {
				id: {},
				cat_id: {},
				name: {},
				contains_catnip: {},
			},
			belongsTo: {
				cat: {model: "Cat", key: "cat_id"},
			}
		}
	};
}

ORM.register([PetOwner, Cat, CatToy, Collar]);

async function performTest() {
	let owner = await PetOwner.findOne();
	console.log(owner, await owner.catToys());
}

async function runTest() {
	try {
		await initDB();
		await populateDb();
		// await performTest();
		process.exit();
	}catch(err) {
		console.log('the error', err);
		process.exit();
	}
}

async function initDB() {
	await ORM.knex.schema.dropTableIfExists('pet_owner');
	await ORM.knex.schema.dropTableIfExists('cat');
	await ORM.knex.schema.dropTableIfExists('cat_toy');
	await ORM.knex.schema.dropTableIfExists('collar');
	await ORM.knex.schema.createTable('pet_owner', function (table) {
	  table.increments();
	  table.string('name');
	});
	await ORM.knex.schema.createTable('cat', function (table) {
	  table.increments();
	  table.integer('pet_owner_id');
	  table.string('name');
	  table.string('breed');
	});
	await ORM.knex.schema.createTable('collar', function (table) {
	  table.increments();
	  table.integer('cat_id');
	  table.string('color');
	});
	await ORM.knex.schema.createTable('cat_toy', function (table) {
	  table.increments();
	  table.integer('cat_id');
	  table.string('name');
	  table.integer('contains_catnip').defaultTo(0);
	});
}

async function populateDb() {
	let billy = new PetOwner();
	billy.name = "Billy";
	await billy.save();

	let bob = new PetOwner();
	bob.name = "Bob";
	await bob.save();

	let sally = new PetOwner();
	sally.name = "sally";
	await sally.save();

	let spot = new Cat();
	spot.pet_owner_id = billy._id();
	spot.name = "spot";
	spot.breed = "Shorthair";
	await spot.save();

	let fluffy = new Cat();
	fluffy.pet_owner_id = billy._id();
	fluffy.name = "fluffy";
	fluffy.breed = "Longhair";
	await fluffy.save();

	let felix = new Cat();
	felix.pet_owner_id = billy._id();
	felix.name = "felix";
	felix.breed = "Shorthair";
	await felix.save();

	let max = new Cat();
	max.pet_owner_id = bob._id();
	max.name = "max";
	max.breed = "Shorthair";
	await max.save();

	let fez = new Cat();
	fez.pet_owner_id = bob._id();
	fez.name = "fez";
	fez.breed = "Shorthair";
	await fez.save();

	let lucy = new Cat();
	lucy.pet_owner_id = sally._id();
	lucy.name = "lucy";
	lucy.breed = "Shorthair";
	await lucy.save();

	let toy;
	toy = new CatToy();
	toy.name = "Ball of Yarn";
	toy.cat_id = spot._id();
	await toy.save();

	toy = new CatToy();
	toy.name = "Ball of Yarn";
	toy.cat_id = fluffy._id();
	await toy.save();

	toy = new CatToy();
	toy.name = "Ball of Yarn";
	toy.cat_id = felix._id();
	await toy.save();

	toy = new CatToy();
	toy.name = "Scratching post";
	toy.cat_id = max._id();
	await toy.save();

	toy = new CatToy();
	toy.name = "Scratching post";
	toy.cat_id = fez._id();
	await toy.save();

	toy = new CatToy();
	toy.name = "Scratching post";
	toy.cat_id = lucy._id();
	await toy.save();

	toy = new CatToy();
	toy.name = "Squeaky Mouse";
	toy.cat_id = felix._id();
	await toy.save();

	toy = new CatToy();
	toy.name = "Squeaky Mouse";
	toy.cat_id = fez._id();
	await toy.save();

	const cats = await Cat.find();
	cats.map(async cat => {

		let collar = new Collar();
		collar.cat_id = cat._id();
		collar.color = "blue";

		//@TODO WHY ISNT THIS SAVING
		try {
			console.log(await collar.save());
		}catch(err) {
			console.log('err', err)
		}

	});
}

runTest()
