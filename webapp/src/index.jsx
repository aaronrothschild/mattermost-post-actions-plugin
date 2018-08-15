import {getMenu} from './actions';
import Reducer from './reducers';
import PluginId from './plugin_id';
import PostActions from './components/post_actions';
import AskModal from './components/ask_modal';

export default class Plugin {
    // eslint-disable-next-line no-unused-vars
    initialize(registry, store) {
        registry.registerReducer(Reducer);
        registry.registerRootComponent(AskModal);
        registry.registerPostDropdownMenuComponent(PostActions);
        registry.registerWebSocketEventHandler('config_changed', () => {
            store.dispatch(getMenu());
        });
        registry.registerReconnectHandler(() => {
            store.dispatch(getMenu());
        });
        store.dispatch(getMenu());
    }
}

window.registerPlugin(PluginId, new Plugin());
