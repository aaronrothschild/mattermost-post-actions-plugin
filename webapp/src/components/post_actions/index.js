import {connect} from 'react-redux';

import {haveICurrentChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import PostActions from './post_actions.jsx';

function filterSubMenu(state, menu, user, post) {
    const result = [];
    for (const menuEntry of menu) {
        if (menuEntry.type === 'separator') {
            result.push(menuEntry);
        } else if (menuEntry.type === 'action') {
            let permissions;
            if (post.user_id === user.id) {
                permissions = menuEntry.action.own_post_permissions || [];
            } else {
                permissions = menuEntry.action.others_post_permissions || [];
            }
            let canIRunThisAction = true;
            for (const permission of permissions) {
                if (!haveICurrentChannelPermission(state, {permission})) {
                    canIRunThisAction = false;
                }
            }

            if (canIRunThisAction) {
                result.push(menuEntry);
            }
        } else if (menuEntry.type === 'category') {
            result.push({
                ...menuEntry,
                submenu: filterSubMenu(state, menuEntry.submenu, user, post),
            });
        }
    }
    return result;
}

function mapStateToProps(state, ownProps) {
    const user = getCurrentUser(state);
    const post = getPost(state, ownProps.postId);

    const menu = filterSubMenu(state, state['plugins-post-actions-plugin'].menu || [], user, post);

    return {
        postId: ownProps.postId,
        channelId: post.channelId,
        menu,
    };
}

export default connect(mapStateToProps)(PostActions);
