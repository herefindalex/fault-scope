package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/herefindalex/fault-scope/internal/buildinfo"
)

func command(name string, args ...string) error {
	cmd := exec.Command(name, args...)
	cmd.Stdout, cmd.Stderr, cmd.Stdin = os.Stdout, os.Stderr, os.Stdin
	return cmd.Run()
}

func output(name string, args ...string) (string, error) {
	data, err := exec.Command(name, args...).Output()
	return strings.TrimSpace(string(data)), err
}

func copyTree(from, to string) error {
	return filepath.WalkDir(from, func(source string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		relative, err := filepath.Rel(from, source)
		if err != nil {
			return err
		}
		target := filepath.Join(to, relative)
		if entry.IsDir() {
			return os.MkdirAll(target, 0755)
		}
		in, err := os.Open(source)
		if err != nil {
			return err
		}
		defer in.Close()
		out, err := os.Create(target)
		if err != nil {
			return err
		}
		_, copyErr := io.Copy(out, in)
		closeErr := out.Close()
		if copyErr != nil {
			return copyErr
		}
		return closeErr
	})
}

func build() error {
	if err := generateSnippets(); err != nil {
		return err
	}
	if err := validateCase(); err != nil {
		return err
	}
	published, err := publishedCaseIDs()
	if err != nil {
		return err
	}
	if err := os.RemoveAll("web/out"); err != nil {
		return err
	}
	if err := command("pnpm", "--dir", "web", "build"); err != nil {
		return err
	}
	stage := filepath.Join("internal", "webui", "dist")
	if err := os.RemoveAll(stage); err != nil {
		return err
	}
	if err := copyTree("web/out", stage); err != nil {
		return err
	}
	hash, err := buildinfo.Hash(os.DirFS(stage))
	if err != nil {
		return err
	}
	commit, err := output("git", "rev-parse", "HEAD")
	if err != nil {
		return err
	}
	status, err := output("git", "status", "--porcelain")
	if err != nil {
		return err
	}
	const version = "0.0.1-preview"
	dirty := status != ""
	manifest := buildinfo.Manifest{
		SchemaVersion: 1, Version: version, Commit: commit, Dirty: dirty,
		ContentHash: hash, Cases: published, CodeLenses: languages,
	}
	data, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(stage, "faultscope-build.json"), append(data, '\n'), 0644); err != nil {
		return err
	}
	if err := os.MkdirAll("dist", 0755); err != nil {
		return err
	}
	name := "faultscope"
	if runtime.GOOS == "windows" {
		name += ".exe"
	}
	ldflags := fmt.Sprintf("-X github.com/herefindalex/fault-scope/internal/buildinfo.Version=%s -X github.com/herefindalex/fault-scope/internal/buildinfo.Commit=%s -X github.com/herefindalex/fault-scope/internal/buildinfo.Dirty=%t", version, commit, dirty)
	cmd := exec.Command("go", "build", "-tags", "bundled", "-ldflags", ldflags, "-o", filepath.Join("dist", name), "./cmd/faultscope")
	cmd.Stdout, cmd.Stderr = os.Stdout, os.Stderr
	cmd.Env = append(os.Environ(), "CGO_ENABLED=0")
	return cmd.Run()
}

func check() error {
	if err := generateSnippets(); err != nil {
		return err
	}
	if err := validateCase(); err != nil {
		return err
	}
	if err := os.RemoveAll("web/.next/types"); err != nil {
		return err
	}
	if err := command("go", "test", "./..."); err != nil {
		return err
	}
	if err := command("pnpm", "--dir", "web", "typecheck"); err != nil {
		return err
	}
	if err := command("pnpm", "--dir", "web", "format:check"); err != nil {
		return err
	}
	return command("pnpm", "--dir", "web", "test")
}

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "usage: go run ./tools {generate|dev|preview|check|build|doctor}")
		os.Exit(2)
	}
	var err error
	switch os.Args[1] {
	case "generate":
		err = generateSnippets()
	case "dev":
		options, parseErr := parseDevOptions(os.Args[2:])
		err = parseErr
		if err == nil {
			err = generateSnippets()
		}
		if err == nil {
			watchSnippets()
			if options.open {
				openWhenReady("http://127.0.0.1:3000", options.target("http://127.0.0.1:3000"))
			}
			if options.includeDrafts {
				_ = os.Setenv("FAULTSCOPE_INCLUDE_DRAFTS", "1")
			}
			err = command("pnpm", "--dir", "web", "dev")
		}
	case "preview":
		options, parseErr := parseDevOptions(os.Args[2:])
		err = parseErr
		if options.includeDrafts {
			err = fmt.Errorf("preview exports published cases only")
		}
		if err == nil {
			err = build()
		}
		if err == nil {
			base := previewBase(options.listen)
			if options.open {
				openWhenReady(base, options.target(base))
			}
			args := []string{}
			if options.listen != "" {
				args = append(args, "--listen", options.listen)
			}
			name := "faultscope"
			if runtime.GOOS == "windows" {
				name += ".exe"
			}
			err = command(filepath.Join(".", "dist", name), args...)
		}
	case "check":
		all, language, caseID := false, "", ""
		for i := 2; i < len(os.Args); i++ {
			switch os.Args[i] {
			case "--all":
				all = true
			case "--language", "--case":
				if i+1 >= len(os.Args) {
					err = fmt.Errorf("missing value for %s", os.Args[i])
					break
				}
				i++
				if os.Args[i-1] == "--language" {
					language = os.Args[i]
				} else {
					caseID = os.Args[i]
				}
			default:
				err = fmt.Errorf("unknown check option %s", os.Args[i])
			}
		}
		if err == nil && caseID != "" && caseID != "fs-c01" {
			err = fmt.Errorf("unknown case %s", caseID)
		}
		if err == nil {
			if language != "" {
				err = generateSnippets()
				if err == nil {
					err = validateCase()
				}
				if err == nil {
					err = checkLanguage(language)
				}
			} else {
				err = check()
				if err == nil && all {
					for _, item := range languages {
						if err = checkLanguage(item); err != nil {
							break
						}
					}
				}
			}
		}
	case "build":
		err = build()
	case "smoke":
		err = smoke()
	case "doctor":
		for _, tool := range []string{"go", "node", "pnpm", "git"} {
			path, lookupErr := exec.LookPath(tool)
			if lookupErr != nil {
				err = errors.Join(err, fmt.Errorf("%s missing: %w", tool, lookupErr))
			} else {
				fmt.Printf("%s: %s\n", tool, path)
			}
		}
		if err == nil {
			nodeVersion, versionErr := output("node", "--version")
			if versionErr != nil || !strings.HasPrefix(nodeVersion, "v24.") {
				err = errors.Join(err, fmt.Errorf("Node 24 required, found %s", nodeVersion))
			} else {
				fmt.Printf("Node: %s\n", nodeVersion)
			}
			pnpmVersion, versionErr := output("pnpm", "--version")
			if versionErr != nil || !strings.HasPrefix(pnpmVersion, "12.") {
				err = errors.Join(err, fmt.Errorf("pnpm 12 required, found %s", pnpmVersion))
			} else {
				fmt.Printf("pnpm: %s\n", pnpmVersion)
			}
		}
	default:
		err = fmt.Errorf("unknown command %q", os.Args[1])
	}
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
