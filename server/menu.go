package main

import (
	"fmt"
)

type ActionQuestionChoice struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

type ActionQuestion struct {
	Choices []ActionQuestionChoice `json:"choices"`
	Key     string                 `json:"key"`
	Name    string                 `json:"name"`
	Type    string                 `json:"type"`
}

type MenuEntry struct {
	Type    string           `json:"type"`
	Id      string           `json:"id,omitempty"`
	Name    string           `json:"name,omitempty"`
	Ask     []ActionQuestion `json:"ask,omitempty"`
	Action  *Action          `json:"action,omitempty"`
	Submenu Menu             `json:"submenu,omitempty"`
}

type Menu []*MenuEntry

func (menuList Menu) getActionFromList(actionId string) (*Action, error) {
	for _, menuEntry := range menuList {
		action, err := menuEntry.getAction(actionId)
		if err != nil {
			return nil, err
		}

		if action != nil {
			return action, nil
		}
	}
	return nil, nil
}

func (menu *MenuEntry) getAction(actionId string) (*Action, error) {
	if menu.Type == "separator" {
		return nil, nil
	}

	if menu.Type == "category" {
		return menu.Submenu.getActionFromList(actionId)
	}

	if menu.Type == "action" {
		if menu.Id == actionId {
			return menu.Action, nil
		}
		return nil, nil
	}

	return nil, fmt.Errorf("unknown menu entry type %s", menu.Type)
}

func sanitizeMenu(menu Menu) Menu {
	if menu == nil {
		return nil
	}

	newMenu := Menu{}
	for _, entry := range menu {
		var action *Action = nil
		if entry.Action != nil {
			action = &Action{
				Url:                   "",
				Key:                   "",
				ExtraConfig:           entry.Action.ExtraConfig,
				OwnPostPermissions:    entry.Action.OwnPostPermissions,
				OthersPostPermissions: entry.Action.OthersPostPermissions,
			}
		}

		newMenu = append(newMenu, &MenuEntry{
			Type:    entry.Type,
			Id:      entry.Id,
			Name:    entry.Name,
			Action:  action,
			Ask:     entry.Ask,
			Submenu: sanitizeMenu(entry.Submenu),
		})
	}
	return newMenu
}
