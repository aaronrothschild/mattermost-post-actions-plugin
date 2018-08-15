import React from 'react';

import PropTypes from 'prop-types';

import {Modal} from 'react-bootstrap';

export default class AskModal extends React.PureComponent {
    static propTypes = {
        channels: PropTypes.array,
        postId: PropTypes.string,
        channelId: PropTypes.string,
        action: PropTypes.object,
        actions: PropTypes.shape({
            runAction: PropTypes.func.isRequired,
            ask: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        action: null,
    }

    constructor(props) {
        super(props);
        this.state = {
            extraData: {},
        };
    }

    onConfirm = () => {
        this.setState({extraData: {}});
        this.props.actions.ask(null, null, null);
        this.props.actions.runAction(this.props.action.id, this.props.postId, this.props.channelId, this.state.extraData);
    }

    renderForm() {
        if (this.props.action === null) {
            return null;
        }

        const form = [];
        for (const question of this.props.action.ask) {
            if (question.type === 'channel') {
                form.push(
                    <div
                        key={question.key}
                        className='form-group'
                        style={{height: '30px'}}
                    >
                        <label
                            htmlFor={question.key}
                            className='col-sm-4'
                        >
                            {question.name}
                        </label>
                        <select
                            className='col-sm-8'
                            id={question.key}
                            onChange={(e) => {
                                this.setState({
                                    extraData: {...this.state.extraData, [question.key]: e.target.value},
                                });
                            }}
                        >
                            {this.props.channels.map((channel) => (
                                <option
                                    value={channel.id}
                                    key={channel.id}
                                >
                                    {channel.display_name}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            } else if (question.type === 'text' || question.type === 'number') {
                form.push(
                    <div
                        key={question.key}
                        className='form-group'
                        style={{height: '30px'}}
                    >
                        <label
                            htmlFor={question.key}
                            className='col-sm-4'
                        >
                            {question.name}
                        </label>
                        <input
                            className='col-sm-8'
                            type={question.type}
                            onChange={(e) => {
                                this.setState({
                                    extraData: {...this.state.extraData, [question.key]: e.target.value},
                                });
                            }}
                        />
                    </div>
                );
            } else if (question.type === 'choice') {
                form.push(
                    <div
                        key={question.key}
                        className='form-group'
                        style={{height: '30px'}}
                    >
                        <label
                            htmlFor={question.key}
                            className='col-sm-4'
                        >
                            {question.name}
                        </label>
                        <select
                            className='col-sm-8'
                            id={question.key}
                            onChange={(e) => {
                                this.setState({
                                    extraData: {...this.state.extraData, [question.key]: e.target.value},
                                });
                            }}
                        >
                            {question.choices.map((option) => (
                                <option
                                    value={option.id}
                                    key={option.id}
                                >
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            }
        }
        return form;
    }

    render() {
        return (
            <Modal
                dialogClassName='admin-modal'
                show={this.props.action !== null}
                onHide={() => this.setState({showResetDefaultModal: false})}
            >
                <Modal.Header
                    closeButton={true}
                >
                    <h4 className='modal-title'>{'Extra data'}</h4>
                </Modal.Header>
                <Modal.Body>
                    {this.renderForm()}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-cancel'
                        onClick={() => {
                            this.props.actions.ask(null, null, null);
                            this.setState({extraData: {}});
                        }}
                    >
                        {'Cancel'}
                    </button>
                    <button
                        id='linkModalCloseButton'
                        type='button'
                        className='btn btn-default'
                        onClick={this.onConfirm}
                    >
                        {'Confirm'}
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
