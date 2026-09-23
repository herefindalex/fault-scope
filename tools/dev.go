package main

import (
	"fmt"
	"net/http"
	"net/url"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

type devOptions struct {
	open          bool
	includeDrafts bool
	listen        string
	caseID        string
	language      string
	mode          string
}

func parseDevOptions(args []string) (devOptions, error) {
	var options devOptions
	for i := 0; i < len(args); i++ {
		switch args[i] {
		case "--open":
			options.open = true
		case "--include-drafts":
			options.includeDrafts = true
		case "--listen", "--case", "--language", "--mode":
			if i+1 >= len(args) {
				return options, fmt.Errorf("missing value for %s", args[i])
			}
			key := args[i]
			i++
			switch key {
			case "--listen":
				options.listen = args[i]
			case "--case":
				options.caseID = args[i]
			case "--language":
				options.language = args[i]
			case "--mode":
				options.mode = args[i]
			}
		default:
			return options, fmt.Errorf("unknown development option %s", args[i])
		}
	}
	if options.caseID != "" && options.caseID != "fs-c01" {
		return options, fmt.Errorf("unknown case %s", options.caseID)
	}
	if options.language != "" {
		found := false
		for _, language := range languages {
			if language == options.language {
				found = true
			}
		}
		if !found {
			return options, fmt.Errorf("unknown language %s", options.language)
		}
	}
	if options.mode != "" && options.mode != "guided" && options.mode != "challenge" && options.mode != "deep-dive" {
		return options, fmt.Errorf("unknown mode %s", options.mode)
	}
	return options, nil
}

func (options devOptions) target(base string) string {
	path := "/"
	if options.caseID != "" || options.mode != "" {
		path = "/cases/should-you-send-it-again/"
	}
	values := url.Values{}
	if options.language != "" {
		values.Set("lang", options.language)
	}
	if options.mode != "" {
		values.Set("mode", options.mode)
	}
	if values.Encode() == "" {
		return base + path
	}
	return base + path + "?" + values.Encode()
}

func openWhenReady(base, target string) {
	go func() {
		client := &http.Client{Timeout: time.Second}
		for i := 0; i < 100; i++ {
			response, err := client.Get(base + "/")
			if err == nil {
				_ = response.Body.Close()
				if response.StatusCode == 200 {
					break
				}
			}
			if i == 99 {
				fmt.Println("Browser not opened: server did not become ready")
				return
			}
			time.Sleep(500 * time.Millisecond)
		}
		name, args := "xdg-open", []string{target}
		switch runtime.GOOS {
		case "darwin":
			name = "open"
		case "windows":
			name, args = "rundll32", []string{"url.dll,FileProtocolHandler", target}
		}
		if err := exec.Command(name, args...).Start(); err != nil {
			fmt.Printf("Open %s manually: %v\n", target, err)
		}
	}()
}

func previewBase(listen string) string {
	if listen == "" {
		return "http://127.0.0.1:8080"
	}
	if strings.HasPrefix(listen, ":") {
		return "http://127.0.0.1" + listen
	}
	if strings.HasPrefix(listen, "0.0.0.0:") {
		return "http://127.0.0.1:" + strings.TrimPrefix(listen, "0.0.0.0:")
	}
	return "http://" + listen
}
