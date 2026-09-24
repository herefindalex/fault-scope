package main

import (
	"os"
	"testing"
)

func TestDeveloperOptions(t *testing.T) {
	if err := os.Chdir(".."); err != nil {
		t.Fatal(err)
	}
	defer func() { _ = os.Chdir("tools") }()
	options, err := parseDevOptions([]string{"--open", "--locale", "ar", "--case", "fs-c01", "--language", "php", "--mode", "challenge"})
	if err != nil {
		t.Fatal(err)
	}
	if !options.open || options.target("http://localhost:3000") != "http://localhost:3000/ar/cases/should-you-send-it-again/?lang=php&mode=challenge" {
		t.Fatalf("unexpected options: %+v", options)
	}
	if _, err := parseDevOptions([]string{"--language", "unknown"}); err == nil {
		t.Fatal("accepted unknown language")
	}
	if _, err := parseDevOptions([]string{"--locale", "xx-INVALID"}); err == nil {
		t.Fatal("accepted unknown locale")
	}
	for _, entry := range []struct {
		selector string
		slug     string
	}{
		{"fs-c02", "can-the-old-worker-still-commit"},
		{"can-the-old-worker-still-commit", "can-the-old-worker-still-commit"},
		{"fs-c03", "database-committed-where-is-event"},
		{"database-committed-where-is-event", "database-committed-where-is-event"},
		{"fs-c04", "consumer-finished-why-run-again"},
		{"fs-c05", "which-event-is-actually-newer"},
		{"fs-c06", "the-read-succeeded-is-it-fresh-enough"},
		{"fs-c07", "did-cancellation-stop-the-work"},
		{"fs-c08", "it-restarted-what-did-it-forget"},
		{"consumer-finished-why-run-again", "consumer-finished-why-run-again"},
	} {
		options, err := parseDevOptions([]string{"--case", entry.selector, "--mode", "guided"})
		if err != nil {
			t.Fatalf("%s: %v", entry.selector, err)
		}
		want := "http://localhost:3000/en/cases/" + entry.slug + "/?mode=guided"
		if got := options.target("http://localhost:3000"); got != want {
			t.Errorf("%s: target %q, want %q", entry.selector, got, want)
		}
	}
}
