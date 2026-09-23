import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => <h2 className="mdx-heading">{children}</h2>,
    p: ({ children }) => <p className="mdx-paragraph">{children}</p>,
    ...components,
  };
}
