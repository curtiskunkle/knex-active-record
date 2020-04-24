import conns from '../connections';
import runIntegrationTest from './runIntegrationTest';

it("Mysql connection configured", () => {
	if (!conns.mysql2) {
		throw new Error("No configuration for mysql 2");
	}
});
runIntegrationTest(conns.mysql2);

