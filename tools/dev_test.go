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
}
