package main

import (
	"encoding/json"
	"os"
	"testing"
)

func TestPublishedCaseNeedsAllLensesAndAnchors(t *testing.T) {
	data, err := os.ReadFile("../web/src/case-data.json")
	if err != nil {
		t.Fatal(err)
	}
	if err := validateCaseData(data); err != nil {
		t.Fatal(err)
	}
	var c caseMetadata
	if err := json.Unmarshal(data, &c); err != nil {
		t.Fatal(err)
	}
	c.CodeLenses = c.CodeLenses[:len(c.CodeLenses)-1]
	changed, err := json.Marshal(c)
	if err != nil {
		t.Fatal(err)
	}
	if err := validateCaseData(changed); err == nil {
		t.Fatal("published case accepted a missing lens")
	}
	c.CodeLenses = languages
	c.SemanticAnchors = c.SemanticAnchors[:len(c.SemanticAnchors)-1]
	changed, err = json.Marshal(c)
	if err != nil {
		t.Fatal(err)
	}
	if err := validateCaseData(changed); err == nil {
		t.Fatal("published case accepted a missing anchor")
	}
}
