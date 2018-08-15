# Mattermost Post Actions Plugin

This plugin allows you to easily add your own post actions inside the "..."
menu in the posts.

It works very similar to the outgoing webhooks, you deploy your own http server
with the endpoints that perform the actions, and you configure your mattermost
server to dispatch the actions to that url.

**Note**: This is a "transient" plugin, we expect to implement this feature
directly inside mattermost-server. We will try to automatize as much as
possible the migration from the plugin to the built-in implementation.

## Installation

Clone the repository:

```
git clone github.com/jespino/mattermost-post-actions-plugin.git
```

Compile everything running:

```
make dist
```

And finally install the `dist/post-actions-plugin.tar.gz` file in your
mattermost instance through the plugins section of the mattermost admin
console.

## Getting Started

The simplest option to start using Post Actions Plugin is to use
https://github.com/jespino/matteractions, an example Python/Flask application
that defines some common actions like **report-abuse**, **translate** or
**autotag**.

matteractions is an open source project, so you can contribute, or you can fork
it to adapt it to your own environment.

## Configuration

For now, the configuration is done thorugh the config/config.json in the
server. To do that you need to set the
`PluginSettings.Plugins.post-actions-plugin.menu` config to a serialized
version of the menu information in json format, for example:

```
[{\"type\":\"separator\"},{\"type\":\"category\",\"name\":\"Auto\",\"submenu\":[{\"type\":\"action\",\"id\":\"spellcheck\",\"name\":\"Spell Check\",\"action\":{\"url\":\"http://localhost:5000/spellcheck\",\
"key\":\"123123\",\"own_post_permissions\":[\"edit_post\"],\"others_post_permissions\":[\"edit_others_posts\"]}},{\"type\":\"action\",\"id\":\"autocorrect\",\"name\":\"Grammar Check\",\"action\":{\"url\":\"http://localhost:5000/autocorrect\",\"key\":\"123123\",\"own_post_permissions\":[\"edit_post\"],\"others_post_permissions\":[\"edit_others_posts\"]}},{\"type\":\"action\",\"id\":\"autotag\",\"name\":\"Tag\",\"action\":{\"url\":\"http://localhost:5000/autotag\",\"key\":\"123123\",\"own_post_permissions\":[\"edit_post\"],\"others_post_permissions\":[\"edit_others_posts\"]}},{\"type\":\"action\",\"id\":\"deepmoji\",\"name\":\"React\",\"action\":{\"url\":\"http://localhost:5000/deepmoji\",\"key\":\"123123\"}}]},{\"type\":\"category\",\"name\":\"Report\",\"submenu\":[{\"type\":\"action\",\"id\":\"report-abuse\",\"name\":\"Report abuse\",\"action\":{\"url\":\"http://localhost:5000/report-abuse\",\"key\":\"123123\"}}]},{\"type\":\"category\",\"name\":\"Send To\",\"submenu\":[{\"type\":\"action\",\"id\":\"send-to-jira\",\"name\":\"Jira\",\"ask\":[{\"choices\":[{\"id\":\"Bug\",\"name\":\"Bug\"},{\"id\":\"Story\",\"name\":\"Story\"}],\"key\":\"type\",\"name\":\"Type\",\"type\":\"choice\"},{\"choices\":null,\"key\":\"summary\",\"name\":\"Summary\",\"type\":\"text\"}],\"action\":{\"url\":\"http://localhost:5000/send-to-jira\",\"key\":\"123123\"}},{\"type\":\"action\",\"id\":\"send-to-trello\",\"name\":\"Trello\",\"action\":{\"url\":\"http://localhost:5000/send-to-trello\",\"key\":\"123123\"}},{\"type\":\"action\",\"id\":\"send-to-other-channel\",\"name\":\"Other channel\",\"ask\":[{\"choices\":null,\"key\":\"channel\",\"name\":\"Destination channel\",\"type\":\"channel\"}],\"action\":{\"url\":\"http://localhost:5000/send-to-other-channel\",\"key\":\"123123\"}}]},{\"type\":\"category\",\"name\":\"Translate to\",\"submenu\":[{\"type\":\"action\",\"id\":\"translate-hi\",\"name\":\"Hindi\",\"action\":{\"url\":\"http://localhost:5000/translate/hi\",\"key\":\"123123\"}},{\"type\":\"action\",\"id\":\"translate-pt\",\"name\":\"Portuguese\",\"action\":{\"url\":\"http://localhost:5000/translate/pt\",\"key\":\"123123\"}},{\"type\":\"action\",\"id\":\"translate-es\",\"name\":\"Spanish\",\"action\":{\"url\":\"http://localhost:5000/translate/es\",\"key\":\"123123\"}},{\"type\":\"action\",\"id\":\"translate-tg\",\"name\":\"Tagalog\",\"action\":{\"url\":\"http://localhost:5000/translate/tg\",\"key\":\"123123\"}},{\"type\":\"action\",\"id\":\"translate-en-inplace\",\"name\":\"English inplace\",\"action\":{\"url\":\"http://localhost:5000/translate/en?inplace=true\",\"key\":\"123123\",\"own_post_permissions\":[\"edit_post\"],\"others_post_permissions\":[\"edit_others_posts\"]}}]},{\"type\":\"category\",\"name\":\"Remind me\",\"submenu\":[{\"type\":\"action\",\"id\":\"remind-me-10-secs\",\"name\":\"in 10 seconds\",\"action\":{\"url\":\"http://localhost:5000/remind-me/10\",\"key\":\"123123\"}},{\"type\":\"action\",\"id\":\"remind-me-10-min\",\"name\":\"in 10 minutes\",\"action\":{\"url\":\"http://localhost:5000/remind-me/600\",\"key\":\"123123\"}},{\"type\":\"action\",\"id\":\"remind-me-1-hour\",\"name\":\"in 1 hour\",\"action\":{\"url\":\"http://localhost:5000/remind-me/3600\",\"key\":\"123123\"}},{\"type\":\"action\",\"id\":\"remind-me-tomorrow\",\"name\":\"tomorrow\",\"action\":{\"url\":\"http://localhost:5000/remind-me/86400\",\"key\":\"123123\"}},{\"type\":\"action\",\"id\":\"remind-me-next-week\",\"name\":\"next week\",\"action\":{\"url\":\"http://localhost:5000/remind-me/604800\",\"key\":\"123123\"}}]}]
```

which is the same json than:

```json
[
    {
        "type": "separator"
    },
    {
        "name": "Auto",
        "submenu": [
            {
                "action": {
                    "key": "123123",
                    "others_post_permissions": [
                        "edit_others_posts"
                    ],
                    "own_post_permissions": [
                        "edit_post"
                    ],
                    "url": "http://localhost:5000/spellcheck"
                },
                "id": "spellcheck",
                "name": "Spell Check",
                "type": "action"
            },
            {
                "action": {
                    "key": "123123",
                    "others_post_permissions": [
                        "edit_others_posts"
                    ],
                    "own_post_permissions": [
                        "edit_post"
                    ],
                    "url": "http://localhost:5000/autocorrect"
                },
                "id": "autocorrect",
                "name": "Grammar Check",
                "type": "action"
            },
            {
                "action": {
                    "key": "123123",
                    "others_post_permissions": [
                        "edit_others_posts"
                    ],
                    "own_post_permissions": [
                        "edit_post"
                    ],
                    "url": "http://localhost:5000/autotag"
                },
                "id": "autotag",
                "name": "Tag",
                "type": "action"
            },
            {
                "action": {
                    "key": "123123",
                    "url": "http://localhost:5000/deepmoji"
                },
                "id": "deepmoji",
                "name": "React",
                "type": "action"
            }
        ],
        "type": "category"
    },
    {
        "name": "Report",
        "submenu": [
            {
                "action": {
                    "key": "123123",
                    "url": "http://localhost:5000/report-abuse"
                },
                "id": "report-abuse",
                "name": "Report abuse",
                "type": "action"
            }
        ],
        "type": "category"
    },
    {
        "name": "Send To",
        "submenu": [
            {
                "action": {
                    "key": "123123",
                    "url": "http://localhost:5000/send-to-jira"
                },
                "ask": [
                    {
                        "choices": [
                            {
                                "id": "Bug",
                                "name": "Bug"
                            },
                            {
                                "id": "Story",
                                "name": "Story"
                            }
                        ],
                        "key": "type",
                        "name": "Type",
                        "type": "choice"
                    },
                    {
                        "key": "summary",
                        "name": "Summary",
                        "type": "text"
                    }
                ],
                "id": "send-to-jira",
                "name": "Jira",
                "type": "action"
            },
            {
                "action": {
                    "key": "123123",
                    "url": "http://localhost:5000/send-to-trello"
                },
                "id": "send-to-trello",
                "name": "Trello",
                "type": "action"
            },
            {
                "action": {
                    "key": "123123",
                    "url": "http://localhost:5000/send-to-other-channel"
                },
                "ask": [
                    {
                        "key": "channel",
                        "name": "Destination channel",
                        "type": "channel"
                    }
                ],
                "id": "send-to-other-channel",
                "name": "Other channel",
                "type": "action"
            }
        ],
        "type": "category"
    },
    {
        "name": "Translate to",
        "submenu": [
            {
                "action": {
                    "key": "123123",
                    "url": "http://localhost:5000/translate/hi"
                },
                "id": "translate-hi",
                "name": "Hindi",
                "type": "action"
            },
            {
                "action": {
                    "key": "123123",
                    "url": "http://localhost:5000/translate/pt"
                },
                "id": "translate-pt",
                "name": "Portuguese",
                "type": "action"
            },
            {
                "action": {
                    "key": "123123",
                    "url": "http://localhost:5000/translate/es"
                },
                "id": "translate-es",
                "name": "Spanish",
                "type": "action"
            },
            {
                "action": {
                    "key": "123123",
                    "url": "http://localhost:5000/translate/tg"
                },
                "id": "translate-tg",
                "name": "Tagalog",
                "type": "action"
            },
            {
                "action": {
                    "key": "123123",
                    "others_post_permissions": [
                        "edit_others_posts"
                    ],
                    "own_post_permissions": [
                        "edit_post"
                    ],
                    "url": "http://localhost:5000/translate/en?inplace=true"
                },
                "id": "translate-en-inplace",
                "name": "English inplace",
                "type": "action"
            }
        ],
        "type": "category"
    },
    {
        "name": "Remind me",
        "submenu": [
            {
                "action": {
                    "key": "123123",
                    "url": "http://localhost:5000/remind-me/10"
                },
                "id": "remind-me-10-secs",
                "name": "in 10 seconds",
                "type": "action"
            },
            {
                "action": {
                    "key": "123123",
                    "url": "http://localhost:5000/remind-me/600"
                },
                "id": "remind-me-10-min",
                "name": "in 10 minutes",
                "type": "action"
            },
            {
                "action": {
                    "key": "123123",
                    "url": "http://localhost:5000/remind-me/3600"
                },
                "id": "remind-me-1-hour",
                "name": "in 1 hour",
                "type": "action"
            },
            {
                "action": {
                    "key": "123123",
                    "url": "http://localhost:5000/remind-me/86400"
                },
                "id": "remind-me-tomorrow",
                "name": "tomorrow",
                "type": "action"
            },
            {
                "action": {
                    "key": "123123",
                    "url": "http://localhost:5000/remind-me/604800"
                },
                "id": "remind-me-next-week",
                "name": "next week",
                "type": "action"
            }
        ],
        "type": "category"
    }
]
```

You can configure it too using the curl call:

```
curl -X POST 'http://localhost:8065/plugins/post-actions-plugin/menu' -H 'x-requested-with: XMLHttpRequest' -H 'authorization: BEARER YOUR-AUTH-KEY-HERE' -H 'origin: http://localhost:8065' -H 'Cookie: MMAUTHTOKEN=YOUR-AUTH-TOKEN; MMUSERID=YOUR-USER-ID' --data "@your-config.json"
```

## How to contribute?

Just open an issue or PR ;)

## License

Mattermost post actions plugin is licensed under Apache 2.0 license.
