package main

import "testing"

func TestListenAddress(t *testing.T) {
	for _, tt := range []struct{ cli, env, want string }{
		{"", "", ":8080"},
		{"", "127.0.0.1:9000", "127.0.0.1:9000"},
		{":7000", ":9000", ":7000"},
	} {
		if got := listenAddress(tt.cli, tt.env); got != tt.want {
			t.Fatalf("got %q, want %q", got, tt.want)
		}
	}
}
