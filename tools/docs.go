package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// Documentation uses ordinary inline Markdown links. Keep this check small:
// it verifies local targets and makes every public guide discoverable in the index.
var markdownLink = regexp.MustCompile(`!?\[[^\]]*\]\(([^)]+)\)`)

func documentationLinks(root, file string) ([]string, error) {
	data, err := os.ReadFile(filepath.Join(root, file))
	if err != nil {
		return nil, err
	}
	var targets []string
	inFence := false
	for number, line := range strings.Split(string(data), "\n") {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "```") || strings.HasPrefix(trimmed, "~~~") {
			inFence = !inFence
			continue
		}
		if inFence {
			continue
		}
		for _, match := range markdownLink.FindAllStringSubmatch(line, -1) {
			target := strings.SplitN(match[1], "#", 2)[0]
			if target == "" || strings.HasPrefix(target, "http://") || strings.HasPrefix(target, "https://") || strings.HasPrefix(target, "mailto:") {
				continue
			}
			target = strings.Trim(target, "<>")
			if strings.Contains(target, " ") {
				target = strings.SplitN(target, " ", 2)[0]
			}
			resolved := filepath.Clean(filepath.Join(filepath.Dir(file), filepath.FromSlash(target)))
			if resolved == ".." || strings.HasPrefix(resolved, ".."+string(filepath.Separator)) {
				return nil, fmt.Errorf("%s:%d: link leaves repository: %s", file, number+1, match[1])
			}
			if _, err := os.Stat(filepath.Join(root, resolved)); err != nil {
				return nil, fmt.Errorf("%s:%d: broken link: %s", file, number+1, match[1])
			}
			targets = append(targets, resolved)
		}
	}
	return targets, nil
}

func validateDocs(root string) error {
	var files []string
	for _, file := range []string{"README.md", "README.zh-TW.md", "CONTRIBUTING.md", "SECURITY.md"} {
		files = append(files, file)
	}
	err := filepath.WalkDir(filepath.Join(root, "docs"), func(path string, entry os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if entry.IsDir() {
			if entry.Name() == "internal" {
				return filepath.SkipDir
			}
			return nil
		}
		if filepath.Ext(path) == ".md" {
			relative, err := filepath.Rel(root, path)
			if err != nil {
				return err
			}
			files = append(files, relative)
		}
		return nil
	})
	if err != nil {
		return err
	}
	index, err := documentationLinks(root, filepath.Join("docs", "README.md"))
	if err != nil {
		return err
	}
	indexed := map[string]int{}
	for _, target := range index {
		if strings.HasPrefix(target, "docs"+string(filepath.Separator)) && filepath.Ext(target) == ".md" {
			indexed[target]++
		}
	}
	for _, file := range files {
		if file != filepath.Join("docs", "README.md") && strings.HasPrefix(file, "docs"+string(filepath.Separator)) && indexed[file] != 1 {
			return fmt.Errorf("%s must have exactly one entry in docs/README.md (found %d)", file, indexed[file])
		}
		if _, err := documentationLinks(root, file); err != nil {
			return err
		}
	}
	fmt.Printf("Documentation links and index checked: %d Markdown files\n", len(files))
	return nil
}
