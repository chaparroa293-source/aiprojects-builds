"use client";

type DeleteAction = () => Promise<void>;

export function DeleteButton({
  action,
  label,
  confirmMessage,
}: {
  action: DeleteAction;
  label: string;
  confirmMessage: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <button type="submit" className="btn btn-danger">
        {label}
      </button>
    </form>
  );
}
