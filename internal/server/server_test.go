package server

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"testing/fstest"

	"github.com/herefindalex/fault-scope/internal/buildinfo"
)

func TestRoutes(t *testing.T) {
	assets := fstest.MapFS{
		"index.html":                         {Data: []byte("home")},
		"cases/example/index.html":           {Data: []byte("case")},
		"_next/static/chunks/example-abc.js": {Data: []byte("js")},
	}
	handler := New(assets, buildinfo.Info{Version: "dev", Commit: "unknown"})
	tests := []struct {
		method, path string
		status       int
		cache        string
	}{
		{"GET", "/", 200, "no-cache"},
		{"HEAD", "/", 200, "no-cache"},
		{"GET", "/cases/example/", 200, "no-cache"},
		{"GET", "/_next/static/chunks/example-abc.js", 200, "public, max-age=31536000, immutable"},
		{"GET", "/healthz", 200, "no-store"},
		{"GET", "/api/version", 200, "no-store"},
		{"GET", "/missing/", 404, ""},
		{"POST", "/", 405, ""},
	}
	for _, tt := range tests {
		t.Run(tt.method+tt.path, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			handler.ServeHTTP(recorder, httptest.NewRequest(tt.method, tt.path, nil))
			if recorder.Code != tt.status {
				t.Fatalf("status %d, want %d", recorder.Code, tt.status)
			}
			if tt.cache != "" && recorder.Header().Get("Cache-Control") != tt.cache {
				t.Fatalf("cache %q, want %q", recorder.Header().Get("Cache-Control"), tt.cache)
			}
			if recorder.Header().Get("X-Content-Type-Options") != "nosniff" {
				t.Fatal("missing nosniff")
			}
			if tt.method == http.MethodHead && recorder.Body.Len() != 0 {
				t.Fatal("HEAD response has a body")
			}
		})
	}
}
