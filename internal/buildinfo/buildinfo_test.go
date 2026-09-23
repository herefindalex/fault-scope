package buildinfo

import (
	"testing"
	"testing/fstest"
)

func TestMismatchFails(t *testing.T) {
	assets := fstest.MapFS{"faultscope-build.json": {Data: []byte(`{"schema_version":1,"version":"wrong","commit":"wrong","dirty":false,"content_hash":"sha256:abc"}`)}}
	if _, err := Verify(assets); err == nil {
		t.Fatal("expected mismatched bundle to fail")
	}
}

func TestContentMismatchFails(t *testing.T) {
	previous := Dirty
	Dirty = "false"
	defer func() { Dirty = previous }()
	assets := fstest.MapFS{
		"index.html":            {Data: []byte("real content")},
		"faultscope-build.json": {Data: []byte(`{"schema_version":1,"version":"dev","commit":"unknown","dirty":false,"content_hash":"sha256:not-the-content"}`)},
	}
	if _, err := Verify(assets); err == nil {
		t.Fatal("expected content mismatch to fail")
	}
}

func TestContentHashVector(t *testing.T) {
	assets := fstest.MapFS{
		"a.txt":                 {Data: []byte("A")},
		"faultscope-build.json": {Data: []byte("excluded")},
	}
	got, err := Hash(assets)
	if err != nil {
		t.Fatal(err)
	}
	const want = "sha256:89d1aee8d2371b90f003b45ade4eea75238f196e5e4b0522b836c2e5254ca830"
	if got != want {
		t.Fatalf("hash %s, want %s", got, want)
	}
}
