import { initDB, populateDb, PetOwner, Cat, CatToy, Collar, Tag } from './provide'
import FileCache from '../src/cache/FileCache';

async function performTest() {
	// console.log(await Cat.findOne());
	await Cat.cache(Cat.findOne());
	await Cat.cache(Cat.findByPk(1));
	await Cat.cache(Cat.findByPk(2));
	await Cat.cache(Cat.findByPk(3));
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
