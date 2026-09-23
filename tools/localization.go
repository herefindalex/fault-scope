package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

type localeDefinition struct {
	ID          string `json:"id"`
	NativeName  string `json:"nativeName"`
	EnglishName string `json:"englishName"`
	Direction   string `json:"direction"`
	Status      string `json:"status"`
}
type caseTranslation struct {
	CaseID   string            `json:"caseId"`
	StepIDs  []string          `json:"stepIds"`
	Messages map[string]string `json:"messages"`
}

var localeIDPattern = regexp.MustCompile(`^[a-z]{2,3}(?:-[A-Za-z]{2,4})?$`)
var placeholderPattern = regexp.MustCompile(`\{[A-Za-z][A-Za-z0-9]*\}`)

func noDuplicateKeys(decoder *json.Decoder) error {
	token, err := decoder.Token()
	if err != nil {
		return err
	}
	delim, ok := token.(json.Delim)
	if !ok {
		return nil
	}
	switch delim {
	case '{':
		seen := map[string]bool{}
		for decoder.More() {
			token, err := decoder.Token()
			if err != nil {
				return err
			}
			key := token.(string)
			if seen[key] {
				return fmt.Errorf("duplicate translation key %q", key)
			}
			seen[key] = true
			if err := noDuplicateKeys(decoder); err != nil {
				return err
			}
		}
	case '[':
		for decoder.More() {
			if err := noDuplicateKeys(decoder); err != nil {
				return err
			}
		}
	}
	_, err = decoder.Token()
	return err
}

func readLocalizedJSON(path string, target any) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	if err := noDuplicateKeys(json.NewDecoder(bytes.NewReader(data))); err != nil {
		return fmt.Errorf("%s: %w", path, err)
	}
	if err := json.Unmarshal(data, target); err != nil {
		return fmt.Errorf("%s: %w", path, err)
	}
	return nil
}

func placeholders(value string) map[string]bool {
	found := map[string]bool{}
	for _, match := range placeholderPattern.FindAllString(value, -1) {
		found[match] = true
	}
	return found
}

func validateMessages(path string, source, translated map[string]string, complete bool) error {
	for key, value := range translated {
		original, exists := source[key]
		if !exists {
			return fmt.Errorf("%s: unknown key %q", path, key)
		}
		if strings.TrimSpace(value) == "" {
			return fmt.Errorf("%s: empty value for %q", path, key)
		}
		if strings.ContainsAny(placeholderPattern.ReplaceAllString(value, ""), "{}") {
			return fmt.Errorf("%s: invalid interpolation placeholder for %q", path, key)
		}
		want, got := placeholders(original), placeholders(value)
		if len(want) != len(got) {
			return fmt.Errorf("%s: placeholder mismatch for %q", path, key)
		}
		for placeholder := range want {
			if !got[placeholder] {
				return fmt.Errorf("%s: placeholder mismatch for %q", path, key)
			}
		}
	}
	if complete {
		for key := range source {
			if translated[key] == "" {
				return fmt.Errorf("%s: required translation missing for %q", path, key)
			}
		}
	}
	return nil
}

func validateLocalization(targetLocale string) error {
	var registry []localeDefinition
	if err := readLocalizedJSON("web/i18n/registry.json", &registry); err != nil {
		return err
	}
	if len(registry) == 0 {
		return fmt.Errorf("locale registry empty")
	}
	var canonicalCase caseMetadata
	if err := readLocalizedJSON("web/src/case-data.json", &canonicalCase); err != nil {
		return err
	}
	stepIDs, err := set(canonicalCase.Steps)
	if err != nil {
		return err
	}
	var sourceUI map[string]string
	if err := readLocalizedJSON("web/i18n/messages/en.json", &sourceUI); err != nil {
		return err
	}
	var sourceCase caseTranslation
	if err := readLocalizedJSON("web/content/cases/fs-c01/locales/en.json", &sourceCase); err != nil {
		return err
	}
	if sourceCase.CaseID != canonicalCase.ID {
		return fmt.Errorf("English Case translation has wrong Case ID")
	}
	for question, options := range canonicalCase.Questions {
		if question == "" {
			return fmt.Errorf("empty canonical question ID")
		}
		for _, option := range options {
			if sourceCase.Messages[option] == "" {
				return fmt.Errorf("English Case translation missing option %s", option)
			}
		}
	}
	seen := map[string]bool{}
	foundTarget := targetLocale == ""
	for _, locale := range registry {
		if !localeIDPattern.MatchString(locale.ID) || seen[locale.ID] {
			return fmt.Errorf("invalid or duplicate locale ID %q", locale.ID)
		}
		seen[locale.ID] = true
		if locale.NativeName == "" || locale.EnglishName == "" ||
			(locale.Direction != "ltr" && locale.Direction != "rtl") ||
			(locale.Status != "source" && locale.Status != "beta" &&
				locale.Status != "reviewed" && locale.Status != "draft") {
			return fmt.Errorf("invalid metadata for locale %s", locale.ID)
		}
		if locale.ID == "ar" && locale.Direction != "rtl" {
			return fmt.Errorf("Arabic locale must be RTL")
		}
		if targetLocale != "" && locale.ID != targetLocale {
			continue
		}
		foundTarget = true
		complete := locale.Status == "source" || locale.Status == "reviewed"
		uiPath := filepath.Join("web", "i18n", "messages", locale.ID+".json")
		var messages map[string]string
		if err := readLocalizedJSON(uiPath, &messages); err != nil {
			return err
		}
		for _, key := range []string{
			"nav.cases", "nav.lenses", "nav.about", "locale.label", "locale.choose",
			"codeLens.label", "codeLens.choose", "case.guided", "case.challenge",
			"case.deepDive", "action.next", "action.previous", "home.title", "home.question",
		} {
			if messages[key] == "" {
				return fmt.Errorf("%s: required shared UI key %q missing", uiPath, key)
			}
		}
		if err := validateMessages(uiPath, sourceUI, messages, complete); err != nil {
			return err
		}
		casePath := filepath.Join("web", "content", "cases", "fs-c01", "locales", locale.ID+".json")
		var content caseTranslation
		if err := readLocalizedJSON(casePath, &content); err != nil {
			return err
		}
		if content.CaseID != canonicalCase.ID {
			return fmt.Errorf("%s: invalid Case ID", casePath)
		}
		translatedSteps, err := set(content.StepIDs)
		if err != nil {
			return fmt.Errorf("%s: %w", casePath, err)
		}
		for step := range translatedSteps {
			if !stepIDs[step] {
				return fmt.Errorf("%s: unknown step ID %q", casePath, step)
			}
		}
		if complete && len(translatedSteps) != len(stepIDs) {
			return fmt.Errorf("%s: reviewed locale has incomplete step IDs", casePath)
		}
		if err := validateMessages(casePath, sourceCase.Messages, content.Messages, complete); err != nil {
			return err
		}
	}
	if !seen["en"] {
		return fmt.Errorf("English source locale missing")
	}
	if !foundTarget {
		return fmt.Errorf("unknown locale %q", targetLocale)
	}
	return nil
}
