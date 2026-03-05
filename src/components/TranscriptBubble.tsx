interface TranscriptBubbleProps {
  userText: string;
  agentText: string;
  accent: string;
}

export function TranscriptBubble({ userText, agentText, accent }: TranscriptBubbleProps) {
  if (!userText && !agentText) return null;

  return (
    <div className="flex flex-col gap-2 w-full max-w-xl mx-auto">
      {userText && (
        <div className="flex justify-end">
          <div
            className="px-4 py-2.5 rounded-2xl rounded-br-sm text-sm text-white max-w-[80%]"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {userText}
          </div>
        </div>
      )}
      {agentText && (
        <div className="flex justify-start">
          <div
            className="px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm max-w-[80%]"
            style={{
              background: `${accent}18`,
              border: `1px solid ${accent}30`,
              color: "#e2e8f0",
            }}
          >
            {agentText}
          </div>
        </div>
      )}
    </div>
  );
}