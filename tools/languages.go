package main

import (
	"fmt"
	"os"
	"path/filepath"
)

func checkLanguage(language string) error {
	fmt.Printf("Checking %s example\n", language)
	switch language {
	case "go":
		return command("go", "test", "./examples/go")
	case "typescript":
		if err := command("pnpm", "--dir", "web", "exec", "tsc", "--noEmit", "--strict", "--skipLibCheck", "--target", "ES2022", "--module", "ESNext", "../examples/typescript/create-vm.ts"); err != nil {
			return err
		}
		return command("node", "--test", "examples/typescript/create-vm.test.ts")
	case "python":
		return command("python3", "-m", "unittest", "discover", "-s", "examples/python", "-p", "*_test.py")
	case "java":
		dir, err := os.MkdirTemp("", "faultscope-java-*")
		if err != nil {
			return err
		}
		defer os.RemoveAll(dir)
		if err := command("javac", "-d", dir, sourcePaths[language], "examples/java/CreateVmTest.java"); err != nil {
			return err
		}
		return command("java", "-cp", dir, "CreateVmTest")
	case "php":
		if err := command("php", "-l", sourcePaths[language]); err != nil {
			return err
		}
		if err := command("php", "-l", "examples/php/CreateVmTest.php"); err != nil {
			return err
		}
		return command("php", "examples/php/CreateVmTest.php")
	case "c":
		return compileAndRun("cc", []string{"-std=c11", "-Wall", "-Wextra", "-Werror"}, "examples/c/create_vm_test.c")
	case "cpp":
		return compileAndRun("c++", []string{"-std=c++17", "-Wall", "-Wextra", "-Werror"}, "examples/cpp/create_vm_test.cpp")
	default:
		return fmt.Errorf("unknown language %s", language)
	}
}

func compileAndRun(compiler string, flags []string, source string) error {
	dir, err := os.MkdirTemp("", "faultscope-compile-*")
	if err != nil {
		return err
	}
	defer os.RemoveAll(dir)
	binary := filepath.Join(dir, "fixture")
	args := append(append([]string{}, flags...), "-o", binary, source)
	if err := command(compiler, args...); err != nil {
		return err
	}
	return command(binary)
}
