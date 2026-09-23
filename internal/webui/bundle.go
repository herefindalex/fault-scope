//go:build bundled

package webui

import (
	"embed"
	"io/fs"
)

//go:embed all:dist
var bundle embed.FS

func Assets() fs.FS {
	root, err := fs.Sub(bundle, "dist")
	if err != nil {
		panic(err)
	}
	return root
}
