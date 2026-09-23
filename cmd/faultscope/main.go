package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/herefindalex/fault-scope/internal/buildinfo"
	"github.com/herefindalex/fault-scope/internal/server"
	"github.com/herefindalex/fault-scope/internal/webui"
)

func listenAddress(cli, env string) string {
	if cli != "" {
		return cli
	}
	if env != "" {
		return env
	}
	return ":8080"
}

func run() error {
	var listen string
	flag.StringVar(&listen, "listen", "", "HTTP listen address (overrides FAULTSCOPE_LISTEN)")
	flag.Parse()
	assets := webui.Assets()
	info, err := buildinfo.Verify(assets)
	if err != nil {
		return fmt.Errorf("verify embedded bundle: %w", err)
	}
	address := listenAddress(listen, os.Getenv("FAULTSCOPE_LISTEN"))
	httpServer := &http.Server{
		Addr:              address,
		Handler:           server.New(assets, info),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
	listener, err := net.Listen("tcp", address)
	if err != nil {
		return err
	}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	serveErr := make(chan error, 1)
	go func() { serveErr <- httpServer.Serve(listener) }()
	log.Printf("FaultScope listening on %s", listener.Addr())
	select {
	case err := <-serveErr:
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return err
	case <-ctx.Done():
		stop()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := httpServer.Shutdown(shutdownCtx); err != nil {
			_ = httpServer.Close()
			return err
		}
		return nil
	}
}

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}
