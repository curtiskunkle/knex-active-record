import { initDB, populateDb, PetOwner, Cat, CatToy, Collar, Tag } from './provide'
import FileCache from '../src/cache/FileCache';

async function performTest() {
	let cache = new FileCache();
	await cache.set('key1', "A value", 5);
	await cache.set('key2', "A value", 10);
	await cache.set('key3', "A value", 15);
	await cache.set('key4', "A value", 20);
	await cache.set('key5', "A value", 200);

	console.log(await cache.get("key7"));
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
