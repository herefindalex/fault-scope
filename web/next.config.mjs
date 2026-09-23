import createMDX from "@next/mdx";

const withMDX = createMDX({});
export default withMDX({
  output: "export",
  trailingSlash: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
});
