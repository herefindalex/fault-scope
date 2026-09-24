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

var caseMetadataPaths = []string{
	"web/src/case-data.json",
	"web/src/case-02-data.json",
	"web/src/case-03-data.json",
	"web/src/case-04-data.json",
	"web/src/case-05-data.json",
	"web/src/case-06-data.json",
}

var canonicalSlugs = map[string]string{
	"fs-c01": "should-you-send-it-again",
	"fs-c02": "can-the-old-worker-still-commit",
	"fs-c03": "database-committed-where-is-event",
	"fs-c04": "consumer-finished-why-run-again",
	"fs-c05": "which-event-is-actually-newer",
	"fs-c06": "the-read-succeeded-is-it-fresh-enough",
}

var requiredCaseAnchors = map[string][]string{
	"fs-c01": {
		"fs-c01.retry-independent-attempt",
		"fs-c01.keep-unresolved",
		"fs-c01.retry-same-logical-operation",
		"fs-c01.retry-with-new-logical-operation",
	},
	"fs-c02": {
		"fs-c02.commit-without-generation",
		"fs-c02.commit-with-generation",
		"fs-c02.local-authority-check",
		"fs-c02.current-generation-commit",
	},
	"fs-c03": {
		"fs-c03.split-dual-write",
		"fs-c03.business-state-commit",
		"fs-c03.durable-publication-intent",
		"fs-c03.relay-publish",
		"fs-c03.mark-publication-complete",
	},
	"fs-c04": {
		"fs-c04.effect-then-ack",
		"fs-c04.ack-before-effect",
		"fs-c04.apply-event-once",
		"fs-c04.redelivery-no-repeat",
		"fs-c04.separate-dedupe-record",
	},
	"fs-c05": {
		"fs-c05.apply-on-arrival",
		"fs-c05.apply-if-newer",
		"fs-c05.reject-stale-revision",
		"fs-c05.accept-newer-revision",
	},
	"fs-c06": {
		"fs-c06.read-current-projection",
		"fs-c06.sleep-before-read",
		"fs-c06.read-at-least-revision",
		"fs-c06.reject-insufficient-revision",
		"fs-c06.serve-fresh-enough-projection",
	},
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

func loadCases() ([]caseMetadata, error) {
	cases := make([]caseMetadata, 0, len(caseMetadataPaths))
	for _, path := range caseMetadataPaths {
		data, err := os.ReadFile(path)
		if err != nil {
			return nil, err
		}
		var c caseMetadata
		if err := json.Unmarshal(data, &c); err != nil {
			return nil, fmt.Errorf("%s: %w", path, err)
		}
		cases = append(cases, c)
	}
	return cases, nil
}

func validateCase() error {
	cases, err := loadCases()
	if err != nil {
		return err
	}
	ids, slugs := map[string]bool{}, map[string]bool{}
	for index, c := range cases {
		data, err := os.ReadFile(caseMetadataPaths[index])
		if err != nil {
			return err
		}
		if err := validateCaseData(data); err != nil {
			return fmt.Errorf("%s: %w", caseMetadataPaths[index], err)
		}
		if ids[c.ID] || slugs[c.Slug] {
			return fmt.Errorf("duplicate Case ID or slug: %s %s", c.ID, c.Slug)
		}
		ids[c.ID], slugs[c.Slug] = true, true
	}
	return nil
}

func publishedCaseIDs() ([]string, error) {
	cases, err := loadCases()
	if err != nil {
		return nil, err
	}
	var ids []string
	for _, c := range cases {
		if c.Status == "published" {
			ids = append(ids, c.ID)
		}
	}
	return ids, nil
}

func validateCaseData(data []byte) error {
	var c caseMetadata
	if err := json.Unmarshal(data, &c); err != nil {
		return err
	}
	if canonicalSlugs[c.ID] != c.Slug || (c.Status != "draft" && c.Status != "published") {
		return fmt.Errorf("invalid Case identity or lifecycle: %s %s", c.ID, c.Slug)
	}
	steps, err := set(c.Steps)
	if err != nil || len(steps) == 0 {
		return fmt.Errorf("invalid Case steps: %v", err)
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
		return fmt.Errorf("missing guided or challenge entry for %s", c.ID)
	}
	if len(c.Questions["challenge"]) < 2 {
		return fmt.Errorf("missing challenge options for %s", c.ID)
	}
	for question, options := range c.Questions {
		if _, err := set(options); err != nil || question == "" || len(options) < 2 {
			return fmt.Errorf("invalid options for question %q", question)
		}
	}
	if c.ID == "fs-c01" {
		for _, question := range []string{"review", "evidence", "scope", "transfer"} {
			if len(c.Questions[question]) < 2 {
				return fmt.Errorf("missing question %s", question)
			}
		}
	}
	for _, visual := range c.RequiredVisualStates {
		if !visuals[visual] {
			return fmt.Errorf("missing visual %s", visual)
		}
	}
	if c.Status == "published" {
		for _, anchor := range requiredCaseAnchors[c.ID] {
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
