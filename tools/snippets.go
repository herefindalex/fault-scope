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

var sourcePaths = map[string]string{
	"go":         "examples/go/create_vm.go",
	"typescript": "examples/typescript/create-vm.ts",
	"python":     "examples/python/create_vm.py",
	"java":       "examples/java/CreateVm.java",
	"php":        "examples/php/CreateVm.php",
	"c":          "examples/c/create_vm.c",
	"cpp":        "examples/cpp/create_vm.cpp",
}

var additionalSourcePaths = map[string][]string{
	"go":         {"examples/go/case02.go", "examples/go/case03.go", "examples/go/case04.go", "examples/go/case05.go"},
	"typescript": {"examples/typescript/case02.ts", "examples/typescript/case03.ts", "examples/typescript/case04.ts", "examples/typescript/case05.ts"},
	"python":     {"examples/python/case02.py", "examples/python/case03.py", "examples/python/case04.py", "examples/python/case05.py"},
	"java":       {"examples/java/Case02.java", "examples/java/Case03.java", "examples/java/Case04.java", "examples/java/Case05.java"},
	"php":        {"examples/php/Case02.php", "examples/php/Case03.php", "examples/php/Case04.php", "examples/php/Case05.php"},
	"c":          {"examples/c/case02.c", "examples/c/case03.c", "examples/c/case04.c", "examples/c/case05.c"},
	"cpp":        {"examples/cpp/case02.cpp", "examples/cpp/case03.cpp", "examples/cpp/case04.cpp", "examples/cpp/case05.cpp"},
}

type registry map[string]map[string]string

func allAnchors() []string {
	var result []string
	for _, id := range []string{"fs-c01", "fs-c02", "fs-c03", "fs-c04", "fs-c05"} {
		result = append(result, requiredCaseAnchors[id]...)
	}
	return result
}

func snippetSourcePaths(language string) []string {
	return append([]string{sourcePaths[language]}, additionalSourcePaths[language]...)
}

func generateSnippets() error {
	result := make(registry)
	for _, anchor := range allAnchors() {
		result[anchor] = make(map[string]string)
	}
	for _, language := range languages {
		for _, path := range snippetSourcePaths(language) {
			data, err := os.ReadFile(path)
			if err != nil {
				return err
			}
			active := ""
			var snippet []string
			for _, line := range strings.Split(string(data), "\n") {
				if index := strings.Index(line, "faultscope:begin "); index >= 0 {
					if active != "" {
						return fmt.Errorf("nested snippet in %s", path)
					}
					active = strings.TrimSpace(line[index+len("faultscope:begin "):])
					if _, ok := result[active]; !ok {
						return fmt.Errorf("unexpected anchor %s in %s", active, path)
					}
					if result[active][language] != "" {
						return fmt.Errorf("duplicate anchor %s in %s", active, language)
					}
					snippet = nil
					continue
				}
				if index := strings.Index(line, "faultscope:end "); index >= 0 {
					end := strings.TrimSpace(line[index+len("faultscope:end "):])
					if active == "" || end != active {
						return fmt.Errorf("mismatched snippet marker in %s", path)
					}
					value := strings.TrimSpace(strings.Join(snippet, "\n"))
					if value == "" {
						return fmt.Errorf("empty snippet %s in %s", active, path)
					}
					result[active][language] = value
					active = ""
					snippet = nil
					continue
				}
				if active != "" {
					snippet = append(snippet, line)
				}
			}
			if active != "" {
				return fmt.Errorf("unclosed snippet %s in %s", active, path)
			}
		}
	}
	for _, anchor := range allAnchors() {
		for _, language := range languages {
			if result[anchor][language] == "" {
				return fmt.Errorf("missing %s in %s", anchor, language)
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
			for _, path := range snippetSourcePaths(language) {
				info, err := os.Stat(path)
				if err != nil {
					continue
				}
				fmt.Fprintf(&value, "%s:%d:%d;", path, info.ModTime().UnixNano(), info.Size())
			}
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
