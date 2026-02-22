import { A } from "@/react/element";

const TERMS = [
    "> WARNING: You will, most likely, lose *all* your tokens; and you have *no* privacy. Therefore, proceed with the utmost caution! 💀",
    "\n\n",
    "*Risk Disclaimer* — by using this DeFi lending and borrowing protocol, you acknowledge and accept the following risks:",
    "\n\n",
    "1. *Loss of Funds* — There are no guarantees of fund recovery. You may lose some or all of your tokens due to smart contract vulnerabilities, economic exploits, or unforeseen market conditions.",
    "\n\n",
    "2. *Lack of Privacy* — Transactions and interactions on this protocol are publicly visible on the Avalanche blockchain. Your activity may be analyzed and tracked by third parties.",
    "\n\n",
    "3. *Regulatory Risks* — This protocol operates without regulatory oversight. Changes in laws, governance attacks, or network disruptions may impact its functionality.",
];

export function TermsLink() {
    return <A
        class={["focus-ring", "text-muted"]} href="#"
        onClick={() => alert(TERMS.join(" "))}
    >
        Terms
    </A>;
}
