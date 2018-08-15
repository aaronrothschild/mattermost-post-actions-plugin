package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"regexp"
	"strings"

	"github.com/mattermost/mattermost-server/model"
	"github.com/mattermost/mattermost-server/plugin"
)

const (
	ACTION_RESPONSE_TYPE_COMMENT  = "comment"
	ACTION_RESPONSE_TYPE_REACTION = "reaction"
	ACTION_RESPONSE_TYPE_EDIT     = "edit"
	ACTION_RESPONSE_TYPE_DELETE   = "delete"
	DEFAULT_USERNAME              = "Post Actions"
)

type Action struct {
	Url                   string   `json:"url,omitempty"`
	Key                   string   `json:"key,omitempty"`
	ExtraConfig           string   `json:"extra_config,omitempty"`
	OwnPostPermissions    []string `json:"own_post_permissions,omitempty"`
	OthersPostPermissions []string `json:"others_post_permissions,omitempty"`
}

type RunRequest struct {
	Action    string                `json:"action"`
	PostId    string                `json:"post_id"`
	ExtraData model.StringInterface `json:"extra_data"`
}

type ActionPayload struct {
	Token       string                `json:"token"`
	TeamId      string                `json:"team_id"`
	TeamName    string                `json:"team_name"`
	ChannelId   string                `json:"channel_id"`
	ChannelName string                `json:"channel_name"`
	Timestamp   int64                 `json:"timestamp"`
	UserId      string                `json:"user_id"`
	UserName    string                `json:"username"`
	PostId      string                `json:"post_id"`
	Text        string                `json:"text"`
	FileIds     []string              `json:"file_ids"`
	ExtraData   model.StringInterface `json:"extra_data"`
}

type ActionResponse struct {
	Text         string                `json:"text"`
	Attachments  []string              `json:"attachments"`
	ResponseType string                `json:"response_type"`
	Props        model.StringInterface `json:"props"`
	Type         string                `json:"type"`
	Username     string                `json:"usename"`
	IconURL      string                `json:"icon_url"`
	ChannelId    string                `json:"channel_id"`
}

// Plugin is the Post Actions plugin object
type Plugin struct {
	plugin.MattermostPlugin

	Menu Menu
}

type Configuration struct {
	Menu string
}

func (p *Plugin) OnConfigurationChange() error {
	var configuration Configuration
	err := p.API.LoadPluginConfiguration(&configuration)
	if err != nil {
		return err
	}
	stdErr := json.Unmarshal([]byte(configuration.Menu), &p.Menu)
	if stdErr != nil {
		p.Menu = Menu{}
		return nil
	}
	return nil
}

func (payload *ActionPayload) toJSON() string {
	b, _ := json.Marshal(payload)
	return string(b)
}

func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	switch path := r.URL.Path; path {
	case "/run":
		p.handlePostAction(c, w, r)
	case "/menu":
		if r.Method == "POST" {
			p.handleSetMenu(c, w, r)
		} else {
			p.handleGetMenu(c, w, r)
		}
	default:
		http.NotFound(w, r)
	}
}

func (p *Plugin) handleGetMenu(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	b, err := json.Marshal(sanitizeMenu(p.Menu))
	if err != nil {
		http.Error(w, fmt.Sprintf("Invalid configuration: %v", err), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(b)
}

func (p *Plugin) handleSetMenu(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	if r.Body != nil {
		defer func() {
			io.Copy(ioutil.Discard, r.Body)
			r.Body.Close()
		}()
	}

	session, err := p.API.GetSession(c.SessionId)
	if err != nil || session == nil {
		http.Error(w, "Invalid user session", http.StatusBadRequest)
		return
	}

	userId := session.UserId

	if !p.API.HasPermissionTo(userId, model.PERMISSION_MANAGE_SYSTEM) {
		http.Error(w, fmt.Sprintf("Not authorized"), http.StatusForbidden)
		return
	}

	var menu Menu
	json.NewDecoder(r.Body).Decode(&menu)
	if menu == nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	config := p.API.GetConfig()
	newConfig, stdErr := json.Marshal(menu)

	if stdErr != nil {
		http.Error(w, fmt.Sprintf("Unable to save the configuration: %s", stdErr.Error()), http.StatusForbidden)
		return
	}

	config.PluginSettings.Plugins["post-actions-plugin"]["menu"] = string(newConfig)
	err = p.API.SaveConfig(config)
	if err != nil {
		http.Error(w, fmt.Sprintf("Unable to save the configuration: %s", err.Error()), http.StatusForbidden)
		return
	}
	p.Menu = menu

	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte("ok"))
}

func (p *Plugin) handlePostAction(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	if r.Body != nil {
		defer func() {
			io.Copy(ioutil.Discard, r.Body)
			r.Body.Close()
		}()
	}

	session, err := p.API.GetSession(c.SessionId)
	if err != nil {
		http.Error(w, "Invalid user session", http.StatusBadRequest)
		return
	}

	userId := session.UserId

	user, err := p.API.GetUser(userId)
	if err != nil {
		http.Error(w, "Invalid user", http.StatusBadRequest)
		return
	}

	var run *RunRequest
	json.NewDecoder(r.Body).Decode(&run)
	if run == nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	post, err := p.API.GetPost(run.PostId)
	if err != nil {
		http.Error(w, fmt.Sprintf("Invalid post %s", run.PostId), http.StatusBadRequest)
		return
	}

	action, stdErr := p.Menu.getActionFromList(run.Action)
	if stdErr != nil {
		http.Error(w, fmt.Sprint("Configuration errror"), http.StatusBadRequest)
		return
	}
	if action == nil {
		http.Error(w, fmt.Sprint("Unknown action"), http.StatusNotFound)
		return
	}

	if !p.checkPostPermissions(userId, post, action) {
		http.Error(w, fmt.Sprintf("Not authorized"), http.StatusForbidden)
		return
	}

	channel, err := p.API.GetChannel(post.ChannelId)
	if err != nil {
		http.Error(w, "Post in invalid channel", http.StatusBadRequest)
		return
	}

	teamId := ""
	teamName := ""
	if channel.Type != model.CHANNEL_DIRECT && channel.Type != model.CHANNEL_GROUP {
		team, err := p.API.GetTeam(channel.TeamId)
		if err != nil {
			http.Error(w, "Post in invalid team", http.StatusBadRequest)
			return
		}
		teamId = team.Id
		teamName = team.Name
	}

	payload := &ActionPayload{
		TeamId:      teamId,
		TeamName:    teamName,
		ChannelId:   post.ChannelId,
		ChannelName: channel.Name,
		Timestamp:   post.CreateAt,
		UserId:      user.Id,
		UserName:    user.Username,
		PostId:      post.Id,
		Text:        post.Message,
		FileIds:     post.FileIds,
		ExtraData:   run.ExtraData,
	}
	p.TriggerAction(payload, action, post, channel)

	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte("ok"))
}

func (p *Plugin) TriggerAction(payload *ActionPayload, action *Action, post *model.Post, channel *model.Channel) {
	body := payload.toJSON()
	url := action.Url

	go func(url string) {
		client := &http.Client{}
		req, _ := http.NewRequest("POST", url, strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Accept", "application/json")
		hasher := sha256.New()
		hasher.Write([]byte(body + action.Key))
		req.Header.Set("X-Action-Signature", hex.EncodeToString(hasher.Sum(nil)))
		resp, err := client.Do(req)
		if err != nil {
			// fmt.Println(utils.T("api.post.handle_action_event_and_forget.event_post.error"), err.Error())
			return
		}
		if resp.Body != nil {
			defer func() {
				io.Copy(ioutil.Discard, resp.Body)
				resp.Body.Close()
			}()
		}

		var responses []*ActionResponse
		json.NewDecoder(resp.Body).Decode(&responses)

		for _, response := range responses {
			if response.ResponseType == ACTION_RESPONSE_TYPE_DELETE {
				p.API.DeletePost(post.Id)
				continue
			}

			if response.Text == "" && len(response.Attachments) == 0 {
				continue
			}

			if response.ResponseType == ACTION_RESPONSE_TYPE_REACTION {
				reaction := model.Reaction{
					UserId:    payload.UserId,
					PostId:    post.Id,
					EmojiName: response.Text,
				}
				if _, err := p.API.AddReaction(&reaction); err != nil {
					p.API.LogError(err.Error())
					return
				}
				continue
			}

			if response.ResponseType == ACTION_RESPONSE_TYPE_EDIT {
				post.Message = response.Text
				p.API.UpdatePost(post)
				if _, err := p.API.UpdatePost(post); err != nil {
					p.API.LogError(err.Error())
					return
				}
				continue
			}

			postRootId := ""
			if response.ResponseType == ACTION_RESPONSE_TYPE_COMMENT {
				postRootId = post.Id
			}
			if len(response.Props) == 0 {
				response.Props = make(model.StringInterface)
			}

			var responseChannel *model.Channel
			if response.ChannelId == "" {
				responseChannel = channel
			} else {
				c, err := p.API.GetChannel(response.ChannelId)
				if err != nil {
					p.API.LogError(err.Error())
					return
				}
				responseChannel = c
			}

			if _, err := p.createActionPost(payload.UserId, responseChannel, response.Text, response.Username, response.IconURL, response.Props, response.Type, postRootId); err != nil {
				p.API.LogError(err.Error())
			}
		}
	}(url)
}

func (p *Plugin) createActionPost(userId string, channel *model.Channel, text, overrideUsername, overrideIconUrl string, props model.StringInterface, postType string, postRootId string) (*model.Post, *model.AppError) {
	linkWithTextRegex := regexp.MustCompile(`<([^\n<\|>]+)\|([^\n>]+)>`)
	text = linkWithTextRegex.ReplaceAllString(text, "[${2}](${1})")

	post := &model.Post{UserId: userId, ChannelId: channel.Id, Message: text, Type: postType, RootId: postRootId}
	post.AddProp("from_post_actions_plugin", "true")
	config := p.API.GetConfig()
	if config.ServiceSettings.EnablePostUsernameOverride {
		if len(overrideUsername) != 0 {
			post.AddProp("override_username", overrideUsername)
		} else {
			post.AddProp("override_username", DEFAULT_USERNAME)
		}
	}

	if config.ServiceSettings.EnablePostIconOverride {
		if len(overrideIconUrl) != 0 {
			post.AddProp("override_icon_url", overrideIconUrl)
		}
	}

	if post.Type == model.POST_EPHEMERAL {
		post := p.API.SendEphemeralPost(userId, post)
		return post, nil
	}

	post, err := p.API.CreatePost(post)
	if err != nil {
		p.API.LogError(err.Error())
	}
	return post, nil
}

func (p *Plugin) checkPostPermissions(userId string, post *model.Post, action *Action) bool {
	var permissions []string
	if userId == post.UserId {
		permissions = action.OwnPostPermissions
	} else {
		permissions = action.OthersPostPermissions
	}

	for _, permission := range permissions {
		permissionObject := stringToPermission(permission)
		if permissionObject == nil {
			p.API.LogError("Unknown permission")
			return false
		}

		if !p.API.HasPermissionToChannel(userId, post.ChannelId, permissionObject) {
			return false
		}
	}
	return true
}

func stringToPermission(id string) *model.Permission {
	for _, permission := range model.ALL_PERMISSIONS {
		if permission.Id == id {
			return permission
		}
	}
	return nil
}
