import request from 'superagent';

export default class Client {
    constructor() {
        this.url = '/plugins/post-actions-plugin';
    }

    getPostActionsMenu = async () => {
        return this.doGet(`${this.url}/menu`);
    }

    runAction = async (action, postId, extraData = {}) => {
        return this.doPost(`${this.url}/run`, {action, post_id: postId, extra_data: extraData});
    }

    doGet = async (url, headers = {}) => {
        headers['X-Requested-With'] = 'XMLHttpRequest';

        try {
            const response = await request.
                get(url).
                set(headers).
                accept('application/json');

            return response.body;
        } catch (err) {
            throw err;
        }
    }

    doPost = async (url, body, headers = {}) => {
        headers['X-Requested-With'] = 'XMLHttpRequest';

        try {
            const response = await request.
                post(url).
                send(body).
                set(headers).
                type('application/json').
                accept('application/json');

            return response.body;
        } catch (err) {
            throw err;
        }
    }
}
