import { initDB, populateDb, PetOwner, Cat, CatToy, Collar, Tag } from './provide'

async function performTest() {
	let collar = await Collar.findOne();

	collar.owner();
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
