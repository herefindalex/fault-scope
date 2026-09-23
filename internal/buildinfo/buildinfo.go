package buildinfo

import (
	"crypto/sha256"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"sort"
)

// Set by the production build. Development builds report truthful defaults.
var Version = "dev"
var Commit = "unknown"
var Dirty = "unknown"

type Manifest struct {
	SchemaVersion int      `json:"schema_version"`
	Version       string   `json:"version"`
	Commit        string   `json:"commit"`
	Dirty         bool     `json:"dirty"`
	ContentHash   string   `json:"content_hash"`
	Cases         []string `json:"cases"`
	CodeLenses    []string `json:"code_lenses"`
}

type Info struct {
	Version     string `json:"version"`
	Commit      string `json:"commit"`
	ContentHash string `json:"content_hash,omitempty"`
	Cases       int    `json:"cases,omitempty"`
	CodeLenses  int    `json:"code_lenses,omitempty"`
}

func Verify(assets fs.FS) (Info, error) {
	info := Info{Version: Version, Commit: Commit}
	data, err := fs.ReadFile(assets, "faultscope-build.json")
	if errors.Is(err, fs.ErrNotExist) && Version == "dev" && Commit == "unknown" {
		return info, nil
	}
	if err != nil {
		return info, err
	}
	var manifest Manifest
	if err := json.Unmarshal(data, &manifest); err != nil {
		return info, err
	}
	if manifest.SchemaVersion != 1 || manifest.Version != Version || manifest.Commit != Commit ||
		(manifest.Dirty && Dirty != "true") || (!manifest.Dirty && Dirty != "false") || manifest.ContentHash == "" {
		return info, errors.New("embedded bundle metadata does not match executable")
	}
	hash, err := Hash(assets)
	if err != nil || hash != manifest.ContentHash {
		return info, errors.New("embedded bundle content hash mismatch")
	}
	info.ContentHash = manifest.ContentHash
	info.Cases = len(manifest.Cases)
	info.CodeLenses = len(manifest.CodeLenses)
	return info, nil
}

// Hash includes every exported path and its bytes, excluding only the manifest.
func Hash(assets fs.FS) (string, error) {
	var names []string
	err := fs.WalkDir(assets, ".", func(name string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !entry.IsDir() && name != "faultscope-build.json" {
			names = append(names, name)
		}
		return nil
	})
	if err != nil {
		return "", err
	}
	sort.Strings(names)
	h := sha256.New()
	for _, name := range names {
		data, err := fs.ReadFile(assets, name)
		if err != nil {
			return "", err
		}
		_, _ = h.Write([]byte(name))
		_, _ = h.Write([]byte{0})
		_, _ = h.Write(data)
	}
	return fmt.Sprintf("sha256:%x", h.Sum(nil)), nil
}
