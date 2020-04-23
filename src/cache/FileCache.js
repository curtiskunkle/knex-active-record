import fs from 'fs';

export default class FileCache {
	constructor(filePath) {
		this.filePath = filePath || 'file-cache.json';
		this.defaultTtl = 120; //todo how will this get configured?
	}

	set(key, value, ttl = null) {
		const filePath = this.filePath;
		const theTtl = ttl || this.defaultTtl;
		const expire = new Date().getTime() + theTtl * 1000;

		return new Promise((resolve, reject) => {
			this.getFileContents(filePath).then(fileContents => {
				fileContents[key] = {value, expire};
				fs.writeFile(filePath, JSON.stringify(fileContents), function (err) {
					if (err) {
						this.debug(err);
						resolve(false);
					}
					resolve(true);
				});
			}).catch(err => {
				fs.writeFile(filePath, JSON.stringify({[key]: {value, expire}}), function (err) {
					if (err) {
						this.debug(err);
						resolve(false);
					}
					resolve(true);
				});
			})
		});
	}

	get(key) {
		const filePath = this.filePath;
		return new Promise((resolve, reject) => {
			this.getFileContents(filePath).then(fileContents => {
				if (typeof fileContents[key] !== 'undefined') {
					resolve(fileContents[key].value);
				}
				resolve(null);
			}).catch(err => {
				this.debug(err);
				resolve(null);
			})
		});
	}

	getFileContents() {
		const filePath = this.filePath;
		return new Promise((resolve, reject) => {
			fs.readFile(filePath, (err, data) => {
			    if (err) reject(err);
			    try {
			    	const currentTimestamp = new Date().getTime();
			    	const fileContents = JSON.parse(data);
			    	const keys = Object.keys(fileContents);
			    	for(let i = 0; i < keys.length; i++) {
			    		if (fileContents[keys[i]].expire < currentTimestamp) {
			    			delete fileContents[keys[i]];
			    		}
			    	}
			    	resolve(fileContents);
			    } catch(err) {
			    	this.debug(err);
			    	resolve({});
			    }
			});
		});
	}

	//@TODO this should be determined by ORM
	debug(err) {
		console.log(err);
	}
}
