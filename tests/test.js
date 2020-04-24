import { initDB, populateDb, PetOwner, Cat, CatToy, Collar, Tag } from './provide'

async function performTest() {
	await Cat.find();
}

async function runTest() {
	try {
		// await initDB();
		// await populateDb();
		await performTest();
		process.exit();
	}catch(err) {
		console.log('the error', err);
		process.exit();
	}
}

runTest()
