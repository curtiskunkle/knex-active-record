import { initDB, populateDb, PetOwner, Cat, CatToy, Collar, Tag } from './provide'
import FileCache from '../src/cache/FileCache';

async function performTest() {
	let cache = new FileCache('/example.json');
	let result = await cache.set('key', "A value", 120);
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
