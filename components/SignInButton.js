import { SignInButton as ClerkSignInButton } from "@clerk/nextjs";

export default function SignInButton() {
  return (
    <ClerkSignInButton mode="modal">
      <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
        Sign In to Comment
      </button>
    </ClerkSignInButton>
  );
}
