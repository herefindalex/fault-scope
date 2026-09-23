package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestValidateDocs(t *testing.T) {
	root := t.TempDir()
	write := func(name, content string) {
		t.Helper()
		path := filepath.Join(root, name)
		if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(path, []byte(content), 0644); err != nil {
			t.Fatal(err)
		}
	}
	write("README.md", "[Docs](docs/README.md)\n")
	write("README.zh-TW.md", "[English](README.md)\n")
	write("CONTRIBUTING.md", "[Guide](docs/guide.md)\n")
	write("SECURITY.md", "[Docs](docs/README.md)\n")
	write("docs/README.md", "[Guide](guide.md)\n")
	write("docs/guide.md", "[Home](../README.md)\n")
	if err := validateDocs(root); err != nil {
		t.Fatal(err)
	}
	write("docs/guide.md", "[Missing](absent.md)\n")
	if err := validateDocs(root); err == nil || !strings.Contains(err.Error(), "broken link") {
		t.Fatalf("expected broken link, got %v", err)
	}
	write("docs/guide.md", "[Home](../README.md)\n")
	write("docs/README.md", "No guide entry\n")
	if err := validateDocs(root); err == nil || !strings.Contains(err.Error(), "exactly one entry") {
		t.Fatalf("expected missing index entry, got %v", err)
	}
}
