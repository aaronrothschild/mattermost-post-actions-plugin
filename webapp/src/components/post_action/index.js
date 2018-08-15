import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {runAction, ask} from '../../actions';

import PostAction from './post_action.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
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

export default connect(mapStateToProps, mapDispatchToProps)(PostAction);
