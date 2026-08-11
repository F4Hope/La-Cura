import type {
  ReactNode,
} from "react";

type Props = {
  children: ReactNode;
};

export default function LoginTemplate({
  children,
}: Props) {
  return (
    <div
      className="login-premium-shell"
      data-lacura-login="premium"
    >
      {children}
    </div>
  );
}
