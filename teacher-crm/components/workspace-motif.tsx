type Motif = "calendar" | "students" | "receipt" | "complete";

export function WorkspaceMotif({ kind }: { kind: Motif }) {
  const drawings = {
    calendar: <><rect x="29" y="27" width="58" height="54" rx="7" /><path d="M29 42h58M44 20v14M72 20v14m-26 24 8 8 17-18" /></>,
    students: <><path d="M58 39c-12-7-24-5-30-3v44c12-3 23-2 30 3 8-5 19-6 31-3V36c-10-3-21-3-31 3Zm0 0v44M37 48l12 2M37 57l12 2M68 49l11-2M68 58l11-2" /><path d="m87 18 2 5 6 1-5 4v6l-5-3-5 2 1-6-4-4 6-1Z" /></>,
    receipt: <><path d="M37 25h44v61l-7-4-8 4-7-4-7 4-7-4-8 4V25Z" /><path d="M47 40h24M47 50h17M47 65h24M47 72h12" /><path d="m84 38 12-5M86 46h13" /></>,
    complete: <><path d="M83 44a27 27 0 1 1-18-17" /><path d="m46 51 11 11 28-29M91 22v8M87 26h8" /></>,
  };
  return <svg className={`workspace-motif motif-${kind}`} aria-hidden="true" viewBox="0 0 120 105" fill="none"><ellipse cx="59" cy="58" rx="44" ry="37" fill="currentColor" opacity=".07" /><g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{drawings[kind]}<path d="M19 72h6M22 69v6" opacity=".5" /></g></svg>;
}
