package main

import (
	"encoding/json"
	"os"
	"strings"
	"testing"
)

func TestLocalizationCatalog(t *testing.T) {
	if err := os.Chdir(".."); err != nil {
		t.Fatal(err)
	}
	defer func() { _ = os.Chdir("tools") }()
	if err := validateLocalization(""); err != nil {
		t.Fatal(err)
	}
	if err := validateLocalization("ja"); err != nil {
		t.Fatal(err)
	}
	if err := validateLocalization("xx-INVALID"); err == nil {
		t.Fatal("unknown locale accepted")
	}
}

func TestLocalizationValidationRejectsDuplicateAndMissingReviewedContent(t *testing.T) {
	var result map[string]string
	if err := noDuplicateKeys(json.NewDecoder(strings.NewReader(`{"x":"one","x":"two"}`))); err == nil {
		t.Fatal("duplicate key accepted")
	}
	source := map[string]string{"title": "Retry {operationId}", "body": "Body"}
	result = map[string]string{"title": "再試行 {operationId}"}
	if err := validateMessages("test", source, result, true); err == nil {
		t.Fatal("missing reviewed message accepted")
	}
	if err := validateMessages("test", source, result, false); err != nil {
		t.Fatal(err)
	}
	result["title"] = "再試行 {differentId}"
	if err := validateMessages("test", source, result, false); err == nil {
		t.Fatal("changed interpolation placeholder accepted")
	}
}
