import React from 'react';

import PropTypes from 'prop-types';

import PostAction from '../post_action';
import PostActionsCategory from '../post_actions_category.jsx';

export default class PostActions extends React.PureComponent {
    static propTypes = {
        postId: PropTypes.string.isRequired,
        channelId: PropTypes.string.isRequired,
        menu: PropTypes.array.isRequired,
    };

    render() {
        const actionsList = this.props.menu.map((menuEntry, idx) => {
            if (menuEntry.type === 'action') {
                return (
                    <PostAction
                        key={menuEntry.id}
                        postId={this.props.postId}
                        channelId={this.props.channelId}
                        action={menuEntry}
                    />
                );
            } else if (menuEntry.type === 'category') {
                return (
                    <PostActionsCategory
                        key={menuEntry.id}
                        postId={this.props.postId}
                        channelId={this.props.channelId}
                        menu={menuEntry}
                    />
                );
            } else if (menuEntry.type === 'separator') {
                return (
                    <hr
                        style={{margin: '0'}}
                        key={'sep-' + idx}
                    />
                );
            }
            return null;
        });
        return (
            <React.Fragment>
                {actionsList}
            </React.Fragment>
        );
    }
}
