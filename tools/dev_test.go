package main

import "testing"

func TestDeveloperOptions(t *testing.T) {
	options, err := parseDevOptions([]string{"--open", "--case", "fs-c01", "--language", "php", "--mode", "challenge"})
	if err != nil {
		t.Fatal(err)
	}
	if !options.open || options.target("http://localhost:3000") != "http://localhost:3000/cases/should-you-send-it-again/?lang=php&mode=challenge" {
		t.Fatalf("unexpected options: %+v", options)
	}
	if _, err := parseDevOptions([]string{"--language", "unknown"}); err == nil {
		t.Fatal("accepted unknown language")
	}
}
