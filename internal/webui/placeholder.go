//go:build !bundled

package webui

import (
	"embed"
	"io/fs"
)

//go:embed placeholder.html
var placeholder embed.FS

func Assets() fs.FS {
	return &placeholderFS{FS: placeholder}
}

type placeholderFS struct{ fs.FS }

func (p *placeholderFS) Open(name string) (fs.File, error) {
	if name == "index.html" {
		return p.FS.Open("placeholder.html")
	}
	return p.FS.Open(name)
}
