import conns from '../connections';
import runIntegrationTest from './runIntegrationTest';
import CreateStore from '../../build';

it("Mysql connection configured", () => {
	if (!conns.mysql2) {
		throw new Error("No configuration for mysql 2");
	}
});
//test with passing configuration object AND with passing instantiated knex
runIntegrationTest(CreateStore(conns.mysql2));
runIntegrationTest(CreateStore(require('knex')({...conns.mysql2})));

