import Store from './orm/orm-base';
import DataModelBase from './orm/datamodel-base'

const CreateStore = config => {
    const initializedOrm = new Store(config);
    class Model extends DataModelBase {
    	static get ORM() {
    		return initializedOrm;
    	}
    }
    initializedOrm.Model = Model;
    return initializedOrm;
}
export default CreateStore;
