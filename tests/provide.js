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

export const populateDB = async ORM => {

	let Cat = ORM.modelRegistry['Cat'];
	let CatToy = ORM.modelRegistry['CatToy'];
	let Collar = ORM.modelRegistry['Collar'];
	let Leash = ORM.modelRegistry['Leash'];
	let PetOwner = ORM.modelRegistry['PetOwner'];
	let Tag = ORM.modelRegistry['Tag'];

	//create some petowners with some cats and toys
	const petowners = [
		{
			name: "Billy",
			cats: [
				{
					name: "spot",
					breed: "shorthair",
					toys: [
						{name: "Ball of Yarn"},
						{name: "Scratching Post"},
					]
				},
				{
					name: "fluffly",
					breed: "longhair",
					toys: [
						{name: "Squeaky Mouse"},
					]
				},
				{
					name: "felix",
					breed: "shorthair",
					toys: [],
				},
			]
		},
		{
			name: "Bob",
			cats: [
				{
					name: "ringo",
					breed: "siamese",
					toys: [
						{name: "Mouse on a string"},
					]
				},
			]
		},
		{
			name: "Sally",
			cats: [
				{
					name: "fez",
					breed: "shorthair",
					toys: [
						{name: "Laser light"},
					]
				},
				{
					name: "bear",
					breed: "shorthair",
					toys: [
						{name: "Ball of yarn"},
						{name: "Stuffed mouse"},
					]
				},
			]
		}
	];

	//create the records described above
	for (let i = 0; i < petowners.length; i++) {
		let thisPetOwner = petowners[i];
		let petowner = new PetOwner();
		petowner.name = thisPetOwner.name;
		await petowner.save();
		for (let j = 0; j < thisPetOwner.cats.length; j++) {
			let thisCat = thisPetOwner.cats[j];
			let cat = new Cat();
			cat.pet_owner_id = petowner._id();
			cat.name = thisCat.name;
			cat.breed = thisCat.breed;
			await cat.save();
			for (let k = 0; k < thisCat.toys.length; k++) {
				let toy = new CatToy();
				toy.cat_id = cat._id();
				toy.name = thisCat.toys[k].name;
				await toy.save();
			}
		}
	}

	//Then give every cat a leash, collar, and two tags
	const cats = await Cat.find();
	let collar = null;
	for(let i = 0; i < cats.length; i++) {
		collar = new Collar();
		collar.cat_id = cats[i]._id();
		collar.color = "blue";
		await collar.save();
	}

	const collars = await Collar.find();
	let tag = null;
	let leash = null;
	for(let i = 0; i < collars.length; i++) {
		leash = new Leash();
		leash.collar_id = collars[i]._id();
		leash.color = "green";
		await leash.save();

		tag = new Tag();
		tag.collar_id = collars[i]._id();
		tag.message = "This is a tag";
		await tag.save();

		tag = new Tag();
		tag.collar_id = collars[i]._id();
		tag.message = "This is a tag";
		await tag.save();
	}
}
