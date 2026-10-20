import type { AnchorHTMLAttributes } from "react";
import { navigate } from "./router.ts";

export default function Link({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        onClick?.(e);
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    />
  );
}
