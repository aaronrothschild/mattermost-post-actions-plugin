import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getMyChannels} from 'mattermost-redux/selectors/entities/channels';

import {runAction, ask} from '../../actions';

import AskModal from './ask_modal.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
        postId: state['plugins-post-actions-plugin'].ask.postId,
        channelId: state['plugins-post-actions-plugin'].ask.channelId,
        action: state['plugins-post-actions-plugin'].ask.action,
        channels: getMyChannels(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            runAction,
            ask,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AskModal);
