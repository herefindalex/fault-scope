package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

var languages = []string{"go", "typescript", "python", "java", "php", "c", "cpp"}
var anchors = []string{
	"fs-c01.retry-independent-attempt",
	"fs-c01.keep-unresolved",
	"fs-c01.retry-same-logical-operation",
	"fs-c01.retry-with-new-logical-operation",
}
var sourcePaths = map[string]string{
	"go": "examples/go/create_vm.go", "typescript": "examples/typescript/create-vm.ts",
	"python": "examples/python/create_vm.py", "java": "examples/java/CreateVm.java",
	"php": "examples/php/CreateVm.php", "c": "examples/c/create_vm.c",
	"cpp": "examples/cpp/create_vm.cpp",
}

type registry map[string]map[string]string

func generateSnippets() error {
	result := make(registry)
	for _, anchor := range anchors {
		result[anchor] = make(map[string]string)
	}
	for _, language := range languages {
		data, err := os.ReadFile(sourcePaths[language])
		if err != nil {
			return err
		}
		lines := strings.Split(string(data), "\n")
		active := ""
		var snippet []string
		for _, line := range lines {
			if index := strings.Index(line, "faultscope:begin "); index >= 0 {
				if active != "" {
					return fmt.Errorf("nested snippet in %s", language)
				}
				active = strings.TrimSpace(line[index+len("faultscope:begin "):])
				if _, ok := result[active]; !ok {
					return fmt.Errorf("unexpected anchor %s in %s", active, language)
				}
				if result[active][language] != "" {
					return fmt.Errorf("duplicate anchor %s in %s", active, language)
				}
				continue
			}
			if index := strings.Index(line, "faultscope:end "); index >= 0 {
				end := strings.TrimSpace(line[index+len("faultscope:end "):])
				if active == "" || end != active {
					return fmt.Errorf("mismatched anchor end %s in %s", end, language)
				}
				result[active][language] = strings.TrimSpace(strings.Join(snippet, "\n"))
				active, snippet = "", nil
				continue
			}
			if active != "" {
				snippet = append(snippet, line)
			}
		}
		if active != "" {
			return fmt.Errorf("unterminated anchor %s in %s", active, language)
		}
	}
	for _, anchor := range anchors {
		for _, language := range languages {
			if result[anchor][language] == "" {
				return fmt.Errorf("missing %s for %s", anchor, language)
			}
		}
	}
	encoded, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		return err
	}
	if err := os.MkdirAll("web/src/generated", 0755); err != nil {
		return err
	}
	return os.WriteFile(filepath.Join("web", "src", "generated", "snippets.json"), append(encoded, '\n'), 0644)
}

func watchSnippets() {
	fingerprint := func() string {
		var value strings.Builder
		for _, language := range languages {
			info, err := os.Stat(sourcePaths[language])
			if err != nil {
				continue
			}
			fmt.Fprintf(&value, "%s:%d:%d;", language, info.ModTime().UnixNano(), info.Size())
		}
		return value.String()
	}
	previous := fingerprint()
	go func() {
		ticker := time.NewTicker(time.Second)
		defer ticker.Stop()
		for range ticker.C {
			current := fingerprint()
			if current == previous {
				continue
			}
			if err := generateSnippets(); err != nil {
				fmt.Fprintf(os.Stderr, "Code Lens regeneration: %v\n", err)
				continue
			}
			previous = current
			fmt.Println("Code Lens snippets regenerated")
		}
	}()
}
