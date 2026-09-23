package main

import (
	"fmt"
	"os"
)

func checkLanguage(language string) error {
	fmt.Printf("Checking %s example\n", language)
	switch language {
	case "go":
		return command("go", "test", "./examples/go")
	case "typescript":
		return command("pnpm", "--dir", "web", "exec", "tsc", "--noEmit", "--strict", "--skipLibCheck", "--target", "ES2022", "--module", "ESNext", "../examples/typescript/create-vm.ts")
	case "python":
		return command("python3", "-c", "import ast,sys; ast.parse(open(sys.argv[1], encoding='utf-8').read())", sourcePaths[language])
	case "java":
		dir, err := os.MkdirTemp("", "faultscope-java-*")
		if err != nil {
			return err
		}
		defer os.RemoveAll(dir)
		return command("javac", "-d", dir, sourcePaths[language])
	case "php":
		return command("php", "-l", sourcePaths[language])
	case "c":
		return command("cc", "-std=c11", "-Wall", "-Wextra", "-Werror", "-fsyntax-only", sourcePaths[language])
	case "cpp":
		return command("c++", "-std=c++17", "-Wall", "-Wextra", "-Werror", "-fsyntax-only", sourcePaths[language])
	default:
		return fmt.Errorf("unknown language %s", language)
	}
}
