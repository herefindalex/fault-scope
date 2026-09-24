package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"time"

	"github.com/herefindalex/fault-scope/internal/buildinfo"
)

func smoke() error {
	name := "faultscope"
	if runtime.GOOS == "windows" {
		name += ".exe"
	}
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return err
	}
	address := listener.Addr().String()
	_ = listener.Close()
	cmd := exec.Command(filepath.Join(".", "dist", name), "--listen", address)
	var logs bytes.Buffer
	cmd.Stderr = &logs
	if err := cmd.Start(); err != nil {
		return err
	}
	defer func() { _ = cmd.Process.Kill(); _ = cmd.Wait() }()
	base := "http://" + address
	client := &http.Client{Timeout: time.Second}
	ready := false
	for i := 0; i < 50; i++ {
		response, err := client.Get(base + "/healthz")
		if err == nil {
			_ = response.Body.Close()
			if response.StatusCode == 200 {
				ready = true
				break
			}
		}
		time.Sleep(100 * time.Millisecond)
	}
	if !ready {
		return fmt.Errorf("server did not start: %s", logs.String())
	}
	get := func(method, route string, want int, cache string) ([]byte, error) {
		request, err := http.NewRequest(method, base+route, nil)
		if err != nil {
			return nil, err
		}
		response, err := client.Do(request)
		if err != nil {
			return nil, err
		}
		defer response.Body.Close()
		body, err := io.ReadAll(response.Body)
		if err != nil {
			return nil, err
		}
		if response.StatusCode != want {
			return nil, fmt.Errorf("%s %s: status %d, want %d", method, route, response.StatusCode, want)
		}
		if cache != "" && response.Header.Get("Cache-Control") != cache {
			return nil, fmt.Errorf("%s cache %q", route, response.Header.Get("Cache-Control"))
		}
		if response.Header.Get("X-Content-Type-Options") != "nosniff" {
			return nil, fmt.Errorf("%s missing nosniff", route)
		}
		if method == "HEAD" && len(body) != 0 {
			return nil, fmt.Errorf("HEAD %s has body", route)
		}
		if want == 200 && strings.HasSuffix(route, "/") && !strings.Contains(response.Header.Get("Content-Type"), "text/html") {
			return nil, fmt.Errorf("%s wrong MIME", route)
		}
		return body, nil
	}
	var home []byte
	for _, route := range []string{
		"/", "/en/", "/zh-TW/", "/ja/", "/ar/", "/ja/about/",
		"/cases/should-you-send-it-again/",
		"/cases/can-the-old-worker-still-commit/",
		"/cases/database-committed-where-is-event/", "/languages/php/",
		"/cases/consumer-finished-why-run-again/",
		"/en/cases/should-you-send-it-again/",
		"/zh-TW/cases/should-you-send-it-again/",
		"/ja/cases/should-you-send-it-again/",
		"/en/cases/",
		"/en/cases/can-the-old-worker-still-commit/",
		"/zh-TW/cases/can-the-old-worker-still-commit/",
		"/en/cases/database-committed-where-is-event/",
		"/ar/cases/database-committed-where-is-event/",
		"/en/cases/consumer-finished-why-run-again/",
		"/zh-TW/cases/consumer-finished-why-run-again/",
		"/ar/cases/consumer-finished-why-run-again/",
		"/en/languages/go/", "/ja/languages/cpp/", "/ar/languages/c/",
	} {
		body, err := get("GET", route, 200, "no-cache")
		if err != nil {
			return err
		}
		if route == "/" {
			home = body
		}
		if route == "/ar/" && !bytes.Contains(body, []byte(`<html lang="ar" dir="rtl">`)) {
			return fmt.Errorf("Arabic page missing RTL document")
		}
		if route == "/ar/languages/c/" && !bytes.Contains(body, []byte(`<pre dir="ltr">`)) {
			return fmt.Errorf("Arabic code block missing LTR direction")
		}
	}
	for _, check := range []struct {
		method, route string
		status        int
		cache         string
	}{
		{"HEAD", "/", 200, "no-cache"}, {"HEAD", "/en/cases/should-you-send-it-again/", 200, "no-cache"},
		{"HEAD", "/en/cases/can-the-old-worker-still-commit/", 200, "no-cache"},
		{"HEAD", "/en/cases/database-committed-where-is-event/", 200, "no-cache"},
		{"HEAD", "/en/cases/consumer-finished-why-run-again/", 200, "no-cache"},
		{"HEAD", "/api/version", 200, "no-store"}, {"GET", "/healthz", 200, "no-store"},
		{"GET", "/not-real/", 404, ""}, {"GET", "/xx-INVALID/cases/should-you-send-it-again/", 404, ""},
		{"POST", "/", 405, ""},
	} {
		if _, err := get(check.method, check.route, check.status, check.cache); err != nil {
			return err
		}
	}
	js := regexp.MustCompile(`/_next/static/[^" ]+\.js`).Find(home)
	if len(js) == 0 {
		return fmt.Errorf("homepage does not reference static JS")
	}
	request, err := http.NewRequest("GET", base+string(js), nil)
	if err != nil {
		return err
	}
	response, err := client.Do(request)
	if err != nil {
		return err
	}
	_ = response.Body.Close()
	if response.StatusCode != 200 || response.Header.Get("Cache-Control") != "public, max-age=31536000, immutable" || !strings.Contains(response.Header.Get("Content-Type"), "javascript") {
		return fmt.Errorf("static JS response has wrong status, cache or MIME")
	}
	css := regexp.MustCompile(`/_next/static/[^" ]+\.css`).Find(home)
	if len(css) == 0 {
		return fmt.Errorf("homepage does not reference static CSS")
	}
	request, err = http.NewRequest("GET", base+string(css), nil)
	if err != nil {
		return err
	}
	response, err = client.Do(request)
	if err != nil {
		return err
	}
	_ = response.Body.Close()
	if response.StatusCode != 200 || response.Header.Get("Cache-Control") != "public, max-age=31536000, immutable" || !strings.Contains(response.Header.Get("Content-Type"), "text/css") {
		return fmt.Errorf("static CSS response has wrong status, cache or MIME")
	}
	versionBody, err := get("GET", "/api/version", 200, "no-store")
	if err != nil {
		return err
	}
	var info buildinfo.Info
	if err := json.Unmarshal(versionBody, &info); err != nil {
		return err
	}
	var manifest buildinfo.Manifest
	data, err := os.ReadFile(filepath.Join("internal", "webui", "dist", "faultscope-build.json"))
	if err != nil {
		return err
	}
	if err := json.Unmarshal(data, &manifest); err != nil {
		return err
	}
	if info.ContentHash != manifest.ContentHash || info.Commit != manifest.Commit || info.Cases != len(manifest.Cases) || info.CodeLenses != len(manifest.CodeLenses) {
		return fmt.Errorf("version API and bundle manifest differ")
	}
	if err := cmd.Process.Signal(os.Interrupt); err != nil {
		return err
	}
	done := make(chan error, 1)
	go func() { done <- cmd.Wait() }()
	select {
	case err := <-done:
		if err != nil {
			return fmt.Errorf("shutdown: %w", err)
		}
	case <-time.After(12 * time.Second):
		return fmt.Errorf("shutdown exceeded bound")
	}
	fmt.Println("Bundled binary smoke test passed: routes, deep links, assets, headers, metadata, shutdown")
	return nil
}
