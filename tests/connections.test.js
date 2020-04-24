import conns from './connections';
import { doDataModelTest } from './datamodel';

Object.keys(conns).map(connectionType => {
	doDataModelTest(conns[connectionType]);
});
