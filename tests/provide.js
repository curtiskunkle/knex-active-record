import initORM from '../build/index';

export const initDB = async (ORM) => {
	//clean db
	await ORM.knex.schema.dropTableIfExists('pet_owner');
	await ORM.knex.schema.dropTableIfExists('cat');
	await ORM.knex.schema.dropTableIfExists('cat_toy');
	await ORM.knex.schema.dropTableIfExists('collar');
	await ORM.knex.schema.dropTableIfExists('tag');
	await ORM.knex.schema.dropTableIfExists('leash');

	//build schema
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
	await ORM.knex.schema.createTable('leash', function (table) {
	  table.increments();
	  table.integer('collar_id');
	  table.string('color');
	});
	await ORM.knex.schema.createTable('tag', function (table) {
	  table.increments();
	  table.integer('collar_id');
	  table.string('message');
	});
	await ORM.knex.schema.createTable('cat_toy', function (table) {
	  table.increments();
	  table.integer('cat_id');
	  table.string('name');
	  table.integer('contains_catnip').defaultTo(0);
	});
}

// export const populateDb = async() => {
// 	let billy = new PetOwner();
// 	billy.name = "Billy";
// 	await billy.save();

// 	let bob = new PetOwner();
// 	bob.name = "Bob";
// 	await bob.save();

// 	let sally = new PetOwner();
// 	sally.name = "sally";
// 	await sally.save();

// 	let spot = new Cat();
// 	spot.pet_owner_id = billy._id();
// 	spot.name = "spot";
// 	spot.breed = "Shorthair";
// 	await spot.save();

// 	let fluffy = new Cat();
// 	fluffy.pet_owner_id = billy._id();
// 	fluffy.name = "fluffy";
// 	fluffy.breed = "Longhair";
// 	await fluffy.save();

// 	let felix = new Cat();
// 	felix.pet_owner_id = billy._id();
// 	felix.name = "felix";
// 	felix.breed = "Shorthair";
// 	await felix.save();

// 	let max = new Cat();
// 	max.pet_owner_id = bob._id();
// 	max.name = "max";
// 	max.breed = "Shorthair";
// 	await max.save();

// 	let fez = new Cat();
// 	fez.pet_owner_id = bob._id();
// 	fez.name = "fez";
// 	fez.breed = "Shorthair";
// 	await fez.save();

// 	let lucy = new Cat();
// 	lucy.pet_owner_id = sally._id();
// 	lucy.name = "lucy";
// 	lucy.breed = "Shorthair";
// 	await lucy.save();

// 	let toy;
// 	toy = new CatToy();
// 	toy.name = "Ball of Yarn";
// 	toy.cat_id = spot._id();
// 	await toy.save();

// 	toy = new CatToy();
// 	toy.name = "Ball of Yarn";
// 	toy.cat_id = fluffy._id();
// 	await toy.save();

// 	toy = new CatToy();
// 	toy.name = "Ball of Yarn";
// 	toy.cat_id = felix._id();
// 	await toy.save();

// 	toy = new CatToy();
// 	toy.name = "Scratching post";
// 	toy.cat_id = max._id();
// 	await toy.save();

// 	toy = new CatToy();
// 	toy.name = "Scratching post";
// 	toy.cat_id = fez._id();
// 	await toy.save();

// 	toy = new CatToy();
// 	toy.name = "Scratching post";
// 	toy.cat_id = lucy._id();
// 	await toy.save();

// 	toy = new CatToy();
// 	toy.name = "Squeaky Mouse";
// 	toy.cat_id = felix._id();
// 	await toy.save();

// 	toy = new CatToy();
// 	toy.name = "Squeaky Mouse";
// 	toy.cat_id = fez._id();
// 	await toy.save();

// 	const cats = await Cat.find();
// 	let collar = null;
// 	for(let i = 0; i < cats.length; i++) {
// 		collar = new Collar();
// 		collar.cat_id = cats[i]._id();
// 		collar.color = "blue";
// 		await collar.save();
// 	}

// 	const collars = await Collar.find();
// 	let tag = null;
// 	let leash = null;
// 	for(let i = 0; i < collars.length; i++) {
// 		leash = new Leash();
// 		leash.collar_id = collars[i]._id();
// 		leash.color = "green";
// 		await leash.save();

// 		tag = new Tag();
// 		tag.collar_id = collars[i]._id();
// 		tag.message = "This is a tag";
// 		await tag.save();

// 		tag = new Tag();
// 		tag.collar_id = collars[i]._id();
// 		tag.message = "This is a tag";
// 		await tag.save();
// 	}
// }
