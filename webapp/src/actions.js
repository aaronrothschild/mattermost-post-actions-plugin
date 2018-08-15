import {PostTypes} from 'mattermost-redux/action_types';

import PluginActionTypes from './action_types';
import Client from './client';

export function getMenu() {
    return async (dispatch) => {
        const menu = await Client.getPostActionsMenu();
        dispatch({
            type: PluginActionTypes.RECEIVED_POST_ACTIONS_MENU,
            data: menu,
        });
        return {data: menu};
    };
}

export function ask(postId, channelId, action) {
    return async (dispatch) => {
        const data = {
            postId,
            channelId,
            action,
        };
        dispatch({
            type: PluginActionTypes.ACTION_ASK_QUESTIONS,
            data,
        });
        return {data};
    };
}

export function runAction(action, postId, channelId, extraData = {}) {
    return async (dispatch, getState) => {
        try {
            await Client.runAction(action, postId, extraData);
        } catch (error) {
            const post = {
                id: 'postActionsPlugin' + Date.now(),
                create_at: Date.now(),
                update_at: 0,
                edit_at: 0,
                delete_at: 0,
                is_pinned: false,
                user_id: getState().entities.users.currentUserId,
                channel_id: channelId,
                root_id: '',
                parent_id: '',
                original_id: '',
                message: 'Unable to run the action.',
                type: 'system_ephemeral',
                props: {},
                hashtags: '',
                pending_post_id: '',
            };

            dispatch({
                type: PostTypes.RECEIVED_POSTS,
                data: {
                    order: [],
                    posts: {
                        [post.id]: post,
                    },
                },
                channelId,
            });

            return {error};
        }

        return {data: true};
    };
}
