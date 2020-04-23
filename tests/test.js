import { initDB, populateDb, PetOwner, Cat, CatToy, Collar, Tag } from './provide'

async function performTest() {
	let cat = await Cat.findByPk(3);
	console.log(cat);
	console.log(await cat.leash());
}

async function runTest() {
	try {
		await initDB();
		await populateDb();
		await performTest();
		process.exit();
	}catch(err) {
		console.log('the error', err);
		process.exit();
	}
}

runTest()
