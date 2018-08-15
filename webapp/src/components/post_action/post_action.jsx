import React from 'react';

import PropTypes from 'prop-types';

export default class PostAction extends React.PureComponent {
    static propTypes = {
        postId: PropTypes.string.isRequired,
        channelId: PropTypes.string.isRequired,
        action: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            runAction: PropTypes.func.isRequired,
            ask: PropTypes.func.isRequired,
        }).isRequired,
    };

    onClick = () => {
        if (this.props.action.ask) {
            this.props.actions.ask(
                this.props.postId,
                this.props.channelId,
                this.props.action,
            );
            return;
        }
        this.props.actions.runAction(this.props.action.id, this.props.postId, this.props.channelId, {});
    }

    render() {
        return (
            <li
                role='presentation'
            >

                <button
                    className='style--none'
                    role='menuitem'
                    onClick={this.onClick}
                >
                    {this.props.action.name}
                </button>
            </li>
        );
    }
}
