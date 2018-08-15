import React from 'react';

import PropTypes from 'prop-types';

import PostAction from './post_action';

const ROW_SIZE = 30;

export default class PostActionsCategory extends React.PureComponent {
    static propTypes = {
        postId: PropTypes.string.isRequired,
        channelId: PropTypes.string.isRequired,
        menu: PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            open: false,
        };
    }

    render() {
        const actionsList = this.props.menu.submenu.map((menuEntry, idx) => {
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
                        submenu={menuEntry}
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
        const expectedSize = ((actionsList.length - 1) * ROW_SIZE) + 5;
        if (actionsList.length === 0) {
            return null;
        }
        return (
            <li
                role='presentation'
                className={this.state.open ? 'open' : ''}
                onMouseEnter={() => this.setState({open: true})}
                onMouseLeave={() => this.setState({open: false})}
                style={{position: 'relative'}}
            >
                <span
                    className='fa fa-chevron-left back'
                    style={{position: 'absolute', left: '4px', fontSize: '9px', top: '11px'}}
                />
                <button
                    className='style--none'
                    role='menuitem'
                    style={{background: this.state.open ? 'rgba(61, 60, 64, 0.1) none repeat scroll 0% 0%' : 'rgb(255, 255, 255) none repeat scroll 0% 0%'}}
                >
                    <span>{this.props.menu.name}</span>
                </button>

                <ul
                    className='dropdown-menu submenu'
                    style={{position: 'absolute', right: '128px', top: '-' + expectedSize + 'px'}}
                >
                    {actionsList}
                </ul>
            </li>
        );
    }
}
