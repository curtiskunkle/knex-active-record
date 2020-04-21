import ORMBase from './orm/orm-base';
import DataModelBase from './orm/datamodel-base'

const initORM = config => {
    const initializedOrm = new ORMBase(config);
    class Model extends DataModelBase {
    	static get ORM() {
    		return initializedOrm;
    	}
    }
    initializedOrm.Model = Model;
    return initializedOrm;
}
export default initORM;
