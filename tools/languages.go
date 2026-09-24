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
		if err := command("pnpm", "--dir", "web", "exec", "tsc", "--noEmit", "--strict", "--skipLibCheck", "--target", "ES2022", "--module", "ESNext", "../examples/typescript/create-vm.ts", "../examples/typescript/case02.ts", "../examples/typescript/case03.ts", "../examples/typescript/case04.ts", "../examples/typescript/case05.ts", "../examples/typescript/case06.ts", "../examples/typescript/case07.ts", "../examples/typescript/case08.ts"); err != nil {
			return err
		}
		return command("node", "--test", "examples/typescript/create-vm.test.ts", "examples/typescript/case02.test.ts", "examples/typescript/case03.test.ts", "examples/typescript/case04.test.ts", "examples/typescript/case05.test.ts", "examples/typescript/case06.test.ts", "examples/typescript/case07.test.ts", "examples/typescript/case08.test.ts")
	case "python":
		return command("python3", "-m", "unittest", "discover", "-s", "examples/python", "-p", "*_test.py")
	case "java":
		dir, err := os.MkdirTemp("", "faultscope-java-*")
		if err != nil {
			return err
		}
		defer os.RemoveAll(dir)
		if err := command("javac", "-d", dir, sourcePaths[language], "examples/java/CreateVmTest.java", "examples/java/Case02.java", "examples/java/Case02Test.java", "examples/java/Case03.java", "examples/java/Case03Test.java", "examples/java/Case04.java", "examples/java/Case04Test.java", "examples/java/Case05.java", "examples/java/Case05Test.java", "examples/java/Case06.java", "examples/java/Case06Test.java", "examples/java/Case07.java", "examples/java/Case07Test.java", "examples/java/Case08.java", "examples/java/Case08Test.java"); err != nil {
			return err
		}
		for _, test := range []string{"CreateVmTest", "Case02Test", "Case03Test", "Case04Test", "Case05Test", "Case06Test", "Case07Test", "Case08Test"} {
			if err := command("java", "-cp", dir, test); err != nil {
				return err
			}
		}
		return nil
	case "php":
		for _, source := range []string{sourcePaths[language], "examples/php/CreateVmTest.php", "examples/php/Case02.php", "examples/php/Case02Test.php", "examples/php/Case03.php", "examples/php/Case03Test.php", "examples/php/Case04.php", "examples/php/Case04Test.php", "examples/php/Case05.php", "examples/php/Case05Test.php", "examples/php/Case06.php", "examples/php/Case06Test.php", "examples/php/Case07.php", "examples/php/Case07Test.php", "examples/php/Case08.php", "examples/php/Case08Test.php"} {
			if err := command("php", "-l", source); err != nil {
				return err
			}
		}
		for _, test := range []string{"examples/php/CreateVmTest.php", "examples/php/Case02Test.php", "examples/php/Case03Test.php", "examples/php/Case04Test.php", "examples/php/Case05Test.php", "examples/php/Case06Test.php", "examples/php/Case07Test.php", "examples/php/Case08Test.php"} {
			if err := command("php", test); err != nil {
				return err
			}
		}
		return nil
	case "c":
		for _, source := range []string{"examples/c/create_vm_test.c", "examples/c/case02_test.c", "examples/c/case03_test.c", "examples/c/case04_test.c", "examples/c/case05_test.c", "examples/c/case06_test.c", "examples/c/case07_test.c", "examples/c/case08_test.c"} {
			if err := compileAndRun("cc", []string{"-std=c11", "-Wall", "-Wextra", "-Werror", "-pthread"}, source); err != nil {
				return err
			}
		}
		return nil
	case "cpp":
		for _, source := range []string{"examples/cpp/create_vm_test.cpp", "examples/cpp/case02_test.cpp", "examples/cpp/case03_test.cpp", "examples/cpp/case04_test.cpp", "examples/cpp/case05_test.cpp", "examples/cpp/case06_test.cpp", "examples/cpp/case07_test.cpp", "examples/cpp/case08_test.cpp"} {
			if err := compileAndRun("c++", []string{"-std=c++17", "-Wall", "-Wextra", "-Werror", "-pthread"}, source); err != nil {
				return err
			}
		}
		return nil
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
