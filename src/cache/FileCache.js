import fs from 'fs';

export default class FileCache {
	constructor(filePath) {
		this.filePath = filePath;
	}
	set(key, value, ttl) {
		const filePath = this.filePath;
		return new Promise((resolve, reject) => {
			getFileContents(filePath).then(fileContents => {
				fileContents[key] = {value, ttl};
				fs.writeFile(filePath, JSON.stringify(fileContents), function (err) {
					if (err) resolve(false);
					resolve(true);
				});
			}).catch(err => {
				fs.writeFile(filePath, JSON.stringify({[key]: {value, ttl}}), function (err) {
					if (err) resolve(false);
					resolve(true);
				});
			})
		});
	}
	get(key) {
		const filePath = this.filePath;
		return new Promise((resolve, reject) => {
			getFileContents(filePath).then(fileContents => {
				console.log(fileContents);
				resolve(true);
			}).catch(err => {
				resolve(null);
			})
		});
	}
}

const getFileContents = (filePath) => {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, (err, data) => {
		    if (err) reject(err);
		    try {
		    	resolve(JSON.parse(data));
		    } catch(err) {
		    	//log to same debugger as orm here somehow... pass in debug function from ORM when registering cache?
		    	resolve({});
		    }
		});
	});
}
