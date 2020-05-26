import model_definitions from "../model_defintions";
import initORM from '../../build';
import assert from 'assert';
import { initDB, populateDB } from '../provide';

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
			await Cat.truncate();
			await cat.save();
			assert.notEqual(cat._id(), undefined);
		});

		it("it deletes a record", async () => {
			let cat = new Cat();
			cat.name = "spot";
			await Cat.truncate();
			await cat.save();
			assert.equal((await Cat.find()).length, 1);
			await cat.delete();
			assert.equal((await Cat.find()).length, 0);
		});

		it("it updates a record", async () => {
			let cat = new Cat();
			cat.name = "spot";
			await Cat.truncate();
			await cat.save();
			cat.name = "fluffy";
			await cat.save();
			assert.equal((await Cat.findOne()).name, "fluffy");
		});

		it("it throws an error on invalid query", async () => {
			let invalid = new InvalidTable();
			await Cat.truncate();
			assert.rejects(invalid.save());
		});

		it("it selects one", async () => {
			let cat1 = new Cat(); let cat2 = new Cat(); let cat3 = new Cat();
			await Cat.truncate();
			await cat1.save(); await cat2.save(); await cat3.save();
			let theCat = await Cat.findOne();
			assert.equal(theCat._id(), 1);
		});

		it("it selects by pk", async () => {
			let cat1 = new Cat(); let cat2 = new Cat(); let cat3 = new Cat();
			await Cat.truncate();
			await cat1.save(); await cat2.save(); await cat3.save();
			let theCat = await Cat.findByPk(2);
			assert.equal(theCat._id(), 2);
		});

		it("it selects all", async () => {
			let cat1 = new Cat(); let cat2 = new Cat(); let cat3 = new Cat();
			await Cat.truncate();
			await cat1.save(); await cat2.save(); await cat3.save();
			assert.equal((await Cat.find()).length, 3);
		});

		it("it selects where", async () => {
			let cat1 = new Cat(); let cat2 = new Cat(); let cat3 = new Cat();
			cat1.name = "spot"; cat2.name = "spot";
			await Cat.truncate();
			await cat1.save(); await cat2.save(); await cat3.save();
			let cats = await Cat.find().where({name: "spot"});
			assert.equal(cats.length, 2);
			cats.map(c => {
				assert.equal(c.name, "spot");
			});
		});

		it("it selects count", async () => {
			let cat1 = new Cat(); let cat2 = new Cat(); let cat3 = new Cat();
			cat1.name = "spot";
			await Cat.truncate();
			await cat1.save(); await cat2.save(); await cat3.save();
			let count1 = await Cat.count();
			let count2 = await Cat.count('id', {as: 'theCount'});
			let count3 = await Cat.count('id as theCount');
			let count4 = await Cat.count({ count: ['*'] });
			let count5 = await Cat.count({ count: ['*'] }).where({name: "spot"});
			assert.equal(count1[0]['count(*)'], 3);
			assert.equal(count2[0]['theCount'], 3);
			assert.equal(count3[0]['theCount'], 3);
			assert.equal(count4[0]['count'], 3);
			assert.equal(count5[0]['count'], 1);
		});

		it("it selects min", async () => {
			let cat1 = new Cat(); let cat2 = new Cat(); let cat3 = new Cat();
			cat2.name = "spot";
			await Cat.truncate();
			await cat1.save(); await cat2.save(); await cat3.save();
			let min1 = await Cat.min('id', {as: 'theMin'});
			let min2 = await Cat.min('id as theMin');
			let min3 = await Cat.min({ min: ['id'] });
			let min4 = await Cat.min({ min: ['id'] }).where({name: "spot"});
			assert.equal(min1[0]['theMin'], 1);
			assert.equal(min2[0]['theMin'], 1);
			assert.equal(min3[0]['min'], 1);
			assert.equal(min4[0]['min'], 2);
		});

		it("it selects max", async () => {
			let cat1 = new Cat(); let cat2 = new Cat(); let cat3 = new Cat();
			cat2.name = "spot";
			await Cat.truncate();
			await cat1.save(); await cat2.save(); await cat3.save();
			let max1 = await Cat.max('id', {as: 'themax'});
			let max2 = await Cat.max('id as themax');
			let max3 = await Cat.max({ max: ['id'] });
			let max4 = await Cat.max({ max: ['id'] }).where({name: "spot"});
			assert.equal(max1[0]['themax'], 3);
			assert.equal(max2[0]['themax'], 3);
			assert.equal(max3[0]['max'], 3);
			assert.equal(max4[0]['max'], 2);
		});

		it("it selects sum", async () => {
			let cat1 = new Cat(); let cat2 = new Cat(); let cat3 = new Cat();
			cat2.name = "spot";
			await Cat.truncate();
			await cat1.save(); await cat2.save(); await cat3.save();
			let sum1 = await Cat.sum('id', {as: 'thesum'});
			let sum2 = await Cat.sum('id as thesum');
			let sum3 = await Cat.sum({ sum: ['id'] });
			let sum4 = await Cat.sum({ sum: ['id'] }).where({name: "spot"});
			assert.equal(sum1[0]['thesum'], 6);
			assert.equal(sum2[0]['thesum'], 6);
			assert.equal(sum3[0]['sum'], 6);
			assert.equal(sum4[0]['sum'], 2);
		});

		it("it selects avg", async () => {
			let cat1 = new Cat(); let cat2 = new Cat(); let cat3 = new Cat();
			cat2.name = "spot";
			await Cat.truncate();
			await cat1.save(); await cat2.save(); await cat3.save();
			let avg1 = await Cat.avg('id', {as: 'theavg'});
			let avg2 = await Cat.avg('id as theavg');
			let avg3 = await Cat.avg({ avg: ['id'] });
			let avg4 = await Cat.avg({ avg: ['id'] }).where({name: "spot"});
			assert.equal(avg1[0]['theavg'], 2);
			assert.equal(avg2[0]['theavg'], 2);
			assert.equal(avg3[0]['avg'], 2);
			assert.equal(avg4[0]['avg'], 2);
		});

		it("it saves all", async () => {
			let cat1 = new Cat();
			let cat2 = new Cat();
			let toy = new CatToy();
			let owner = new PetOwner();
			let models = [cat1, cat2, toy, owner];
			await initDB(ORM);
			await cat1.save();
			await ORM.saveAll(models);
			assert.equal((await Cat.count({count: "id"}))[0].count, 2);
			assert.equal((await CatToy.count({count: "id"}))[0].count, 1);
			assert.equal((await PetOwner.count({count: "id"}))[0].count, 1);
			assert.equal(cat1._id(), 1);
			assert.equal(cat2._id(), 2);
			assert.equal(toy._id(), 1);
			assert.equal(owner._id(), 1);
		});

		it("it deletes all", async () => {
			let cat1 = new Cat();
			let cat2 = new Cat();
			let toy = new CatToy();
			let owner = new PetOwner();
			let models = [cat1, cat2, toy, owner];
			await initDB(ORM);
			await cat1.save();
			await ORM.saveAll(models);
			await ORM.deleteAll([...models, new PetOwner()]);
			assert.equal((await Cat.count({count: "id"}))[0].count, 0);
			assert.equal((await CatToy.count({count: "id"}))[0].count, 0);
			assert.equal((await PetOwner.count({count: "id"}))[0].count, 0);
		});

		it("it batch creates", async () => {
			await initDB(ORM);
			let cats = [];
			for(let i = 0; i < 200; i++) {
				let cat = new Cat();
				cat.name = "cat" + i;
				cats.push(cat);
			}
			cats[0].name = "spot";
			cats[199].name = "fez";
			await Cat.batchCreate(cats);
			assert.equal((await Cat.count({count: "id"}))[0].count, 200);
			assert.equal((await Cat.findByPk(1)).name, "spot");
			assert.equal((await Cat.findByPk(200)).name, "fez");
		});

		it("it static deletes", async () => {
			await initDB(ORM);
			let cats = [];
			for(let i = 0; i < 200; i++) {
				let cat = new Cat();
				cat.name = "cat" + i;
				cats.push(cat);
			}
			await Cat.batchCreate(cats);
			await Cat.delete().where('id', '>', 100);
			assert.equal((await Cat.count({count: "id"}))[0].count, 100);
			assert.equal((await Cat.max({max: "id"}))[0].max, 100);
		});

		it("it static updates", async () => {
			await initDB(ORM);
			let cats = [];
			for(let i = 0; i < 200; i++) {
				let cat = new Cat();
				cat.name = "cat" + i;
				cats.push(cat);
			}
			await Cat.batchCreate(cats);
			await Cat.update({name: "spot"}).where('id', '>', 100);
			assert.equal((await Cat.count({count: "id"}).where({name:"spot"}))[0].count, 100);
			assert.equal((await Cat.min({min: "id"}).where({name: "spot"}))[0].min, 101);
		});

		it("it fetches hasMany relationship", async () => {
			await initDB(ORM);
			await populateDB(ORM);
			let cats1 = await (await PetOwner.findByPk(1)).cats();
			let cats2 = await (await PetOwner.findByPk(2)).cats();
			let cats3 = await (await PetOwner.findByPk(3)).cats();

			//make sure all the cats have been fetched
			assert.equal(cats1.length, 3);
			assert.equal(cats2.length, 1);
			assert.equal(cats3.length, 2);

			//make sure each owner has the right cats
			assert.equal(Object.values(cats1).map(cat => cat.pet_owner_id).every(id => id === 1), true);
			assert.equal(Object.values(cats2).map(cat => cat.pet_owner_id).every(id => id === 2), true);
			assert.equal(Object.values(cats3).map(cat => cat.pet_owner_id).every(id => id === 3), true);

			//also test fetching hasMany relationship when has none
			//sorry felix :-(
			let felix = await Cat.findOne().where({name: 'felix'});
			let toys = await felix.catToys();
			assert.equal(Array.isArray(toys), true);
			assert.equal(toys.length, 0);
		});

		it("it fetches belongsTo relationship", async () => {
			await initDB(ORM);
			await populateDB(ORM);
			let cats = await Cat.find();
			for (let i = 0; i < cats.length; i++) {
				let cat = cats[i];
				assert.equal(cat.pet_owner_id, (await cat.owner())._id());
			}

			//test when foreign record does not exist
			let aCat = new Cat();
			aCat.pet_owner_id = 123456; //not a real pet owner
			await aCat.save();
			let owner = await aCat.owner();
			assert.equal(owner, null);

			//test when not related
			let wildCat = new Cat();
			await wildCat.save();
			let wildCatOwner = await wildCat.owner();
			assert.equal(wildCatOwner, null);
		});

		it("it fetches hasOne relationship", async () => {
			await initDB(ORM);
			await populateDB(ORM);
			let cats = await Cat.find();
			for (let i = 0; i < cats.length; i++) {
				let cat = cats[i];
				assert.equal(cat._id(), (await cat.collar())._id());
			}

			let aCatWithNoCollar = new Cat();
			await aCatWithNoCollar.save();
			assert.equal(await aCatWithNoCollar.collar(), null);
		});

		it("it fetches hasManyThrough relationship (hasMany - hasMany)", async () => {
			await initDB(ORM);
			await populateDB(ORM);
			const owner1 = await PetOwner.findByPk(1);
			const catIds1 = (await owner1.cats()).map(cat => cat.id);
			const catToys1 = await owner1.catToys();
			const owner2 = await PetOwner.findByPk(2);
			const catIds2 = (await owner2.cats()).map(cat => cat.id);
			const catToys2 = await owner2.catToys();
			const owner3 = await PetOwner.findByPk(3);
			const catIds3 = (await owner3.cats()).map(cat => cat.id);
			const catToys3 = await owner3.catToys();
			for (let i = 0; i < catToys1.length; i++) {assert.notEqual(catIds1.indexOf(catToys1[i].cat_id), -1)}
			for (let i = 0; i < catToys2.length; i++) {assert.notEqual(catIds2.indexOf(catToys2[i].cat_id), -1)}
			for (let i = 0; i < catToys3.length; i++) {assert.notEqual(catIds3.indexOf(catToys3[i].cat_id), -1)}

			let toys;

			let anotherOwner = new PetOwner();
			await anotherOwner.save();
			toys = await anotherOwner.catToys();
			assert.equal(Array.isArray(toys), true);
			assert.equal(toys.length, 0);

			let anotherCat = new Cat();
			anotherCat.pet_owner_id = anotherOwner._id();
			await anotherCat.save();
			toys = await anotherOwner.catToys();
			assert.equal(Array.isArray(toys), true);
			assert.equal(toys.length, 0);

			let anotherToy = new CatToy();
			anotherToy.cat_id = anotherCat._id();
			await anotherToy.save();
			toys = await anotherOwner.catToys();
			assert.equal(toys.length, 1);
			assert.equal(toys[0]._id(), anotherToy._id());
		});

		it("it fetches hasManyThrough relationship (hasOne - hasMany)", async () => {
			await initDB(ORM);
			await populateDB(ORM);
			const cats = await Cat.find();

			for (let i = 0; i < cats.length; i++) {
				let collarId = (await cats[i].collar())._id();
				let tags = await cats[i].tags();
				for(let j = 0; j < tags.length; j++) {
					assert.equal(tags[j].collar_id, collarId);
				}
			}

			let anotherCat = new Cat();
			await anotherCat.save();
			let tags = await anotherCat.tags();
			assert.equal(Array.isArray(tags), true);
			assert.equal(tags.length, 0);

			let collar = new Collar();
			collar.cat_id = anotherCat._id();
			await collar.save();
			let tag = new Tag();
			tag.collar_id = collar._id();
			await tag.save();
			tags = await anotherCat.tags();
			assert.equal(tags.length, 1);
			assert.equal(tags[0]._id(), tag._id());
		});

		it("it fetches hasManyThrough relationship (hasMany - hasOne)", async () => {
			await initDB(ORM);
			await populateDB(ORM);
			
			const owner = await PetOwner.findOne();
			const collars = await owner.collars();
			assert.equal(collars.length, 3);
			for (let i = 0; i < collars.length; i++) {
				const cat = await collars[i].cat();
				assert.equal(cat.pet_owner_id, owner._id());
			}
		});

		it("it fetches hasOneThrough relationship", async () => {
			await initDB(ORM);
			await populateDB(ORM);

			const cats = await Cat.find();
			for(let i = 0; i < cats.length; i++) {
				const leash = await cats[i].leash();
				const collar = await leash.collar();
				assert.equal(collar.cat_id, cats[i]._id());
			}
		});

		it("it fetches belongsToThrough relationship", async () => {
			await initDB(ORM);
			await populateDB(ORM);

			const collars = await Collar.find();
			for(let i = 0; i < collars.length; i++) {
				const cat = await collars[i].cat();
				const owner = await collars[i].owner();
				assert.equal(cat.pet_owner_id, owner._id());
			}
		});

		//necessary because the test will hang if the connection is left open
		it("closing connection...", async () => {
			await ORM.knex.destroy();
		});
	});
}
