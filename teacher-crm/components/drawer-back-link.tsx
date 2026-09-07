import Link from "next/link";

export function DrawerBackLink({ href, destination }: { href: string; destination: string }) {
  return <Link className="drawer-back" href={href} aria-label={`Back to ${destination}`} title={`Back to ${destination}`}><span aria-hidden="true">‹</span></Link>;
}
