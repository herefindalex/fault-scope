package main

import (
	"encoding/json"
	"fmt"
	"os"
)

type caseMetadata struct {
	ID                   string              `json:"id"`
	Slug                 string              `json:"slug"`
	Status               string              `json:"status"`
	GuidedEntry          string              `json:"guided_entry"`
	ChallengeEntry       string              `json:"challenge_entry"`
	Steps                []string            `json:"steps"`
	Questions            map[string][]string `json:"questions"`
	VisualStates         []string            `json:"visual_states"`
	RequiredVisualStates []string            `json:"required_visual_states"`
	SemanticAnchors      []string            `json:"semantic_anchors"`
	CodeLenses           []string            `json:"code_lenses"`
	Sections             []string            `json:"sections"`
}

func set(items []string) (map[string]bool, error) {
	result := make(map[string]bool)
	for _, item := range items {
		if item == "" || result[item] {
			return nil, fmt.Errorf("empty or duplicate item %q", item)
		}
		result[item] = true
	}
	return result, nil
}

func validateCase() error {
	data, err := os.ReadFile("web/src/case-data.json")
	if err != nil {
		return err
	}
	return validateCaseData(data)
}

func publishedCaseIDs() ([]string, error) {
	data, err := os.ReadFile("web/src/case-data.json")
	if err != nil {
		return nil, err
	}
	var c caseMetadata
	if err := json.Unmarshal(data, &c); err != nil {
		return nil, err
	}
	if c.Status == "published" {
		return []string{c.ID}, nil
	}
	return []string{}, nil
}

func validateCaseData(data []byte) error {
	var c caseMetadata
	if err := json.Unmarshal(data, &c); err != nil {
		return err
	}
	if c.ID != "fs-c01" || c.Slug != "should-you-send-it-again" || (c.Status != "draft" && c.Status != "published") {
		return fmt.Errorf("invalid Case 01 identity or lifecycle")
	}
	steps, err := set(c.Steps)
	if err != nil {
		return err
	}
	visuals, err := set(c.VisualStates)
	if err != nil {
		return err
	}
	caseAnchors, err := set(c.SemanticAnchors)
	if err != nil {
		return err
	}
	caseLanguages, err := set(c.CodeLenses)
	if err != nil {
		return err
	}
	sections, err := set(c.Sections)
	if err != nil {
		return err
	}
	if !steps[c.GuidedEntry] || !steps[c.ChallengeEntry] {
		return fmt.Errorf("missing guided or challenge entry")
	}
	for question, options := range c.Questions {
		if _, err := set(options); err != nil || question == "" {
			return fmt.Errorf("invalid options for question %q", question)
		}
	}
	for _, question := range []string{"review", "evidence", "scope", "transfer", "challenge"} {
		if len(c.Questions[question]) < 2 {
			return fmt.Errorf("missing question %s", question)
		}
	}
	for _, visual := range c.RequiredVisualStates {
		if !visuals[visual] {
			return fmt.Errorf("missing visual %s", visual)
		}
	}
	if c.Status == "published" {
		for _, anchor := range anchors {
			if !caseAnchors[anchor] {
				return fmt.Errorf("missing published anchor %s", anchor)
			}
		}
		for _, language := range languages {
			if !caseLanguages[language] {
				return fmt.Errorf("missing published code lens %s", language)
			}
		}
		for _, section := range []string{"property", "counterexample", "positive-control", "scope-challenge", "remaining", "transfer"} {
			if !sections[section] {
				return fmt.Errorf("missing published section %s", section)
			}
		}
	}
	return nil
}
