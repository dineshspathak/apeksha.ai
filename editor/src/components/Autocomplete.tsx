"use client";

/**
 * AI Ghost Text Autocomplete Provider
 * Registers with Monaco to show inline AI suggestions as you type.
 */

const API_URL = "http://127.0.0.1:53702";

let debounceTimer: NodeJS.Timeout | null = null;

export function registerAutocompleteProvider(monaco: any, editor: any) {
  // Register inline completion provider
  const provider = monaco.languages.registerInlineCompletionsProvider("*", {
    provideInlineCompletions: async (model: any, position: any, context: any, token: any) => {
      // Debounce - wait 800ms after user stops typing
      if (debounceTimer) clearTimeout(debounceTimer);

      return new Promise((resolve) => {
        debounceTimer = setTimeout(async () => {
          try {
            const textBeforeCursor = model.getValueInRange({
              startLineNumber: Math.max(1, position.lineNumber - 20),
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            });

            const textAfterCursor = model.getValueInRange({
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: Math.min(model.getLineCount(), position.lineNumber + 10),
              endColumn: model.getLineMaxColumn(Math.min(model.getLineCount(), position.lineNumber + 10)),
            });

            // Don't trigger on empty lines or very short context
            if (textBeforeCursor.trim().length < 10) {
              resolve({ items: [] });
              return;
            }

            const uri = model.uri.toString();
            const filename = uri.split("/").pop() || "file";
            const language = model.getLanguageId();

            const res = await fetch(`${API_URL}/api/ai/autocomplete`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                codeBefore: textBeforeCursor,
                codeAfter: textAfterCursor,
                language,
                filename,
              }),
            });

            if (token.isCancellationRequested) {
              resolve({ items: [] });
              return;
            }

            const data = await res.json();

            if (data.suggestion && data.suggestion.trim()) {
              resolve({
                items: [
                  {
                    insertText: data.suggestion,
                    range: {
                      startLineNumber: position.lineNumber,
                      startColumn: position.column,
                      endLineNumber: position.lineNumber,
                      endColumn: position.column,
                    },
                  },
                ],
              });
            } else {
              resolve({ items: [] });
            }
          } catch {
            resolve({ items: [] });
          }
        }, 800);
      });
    },

    freeInlineCompletions: () => {},
  });

  return provider;
}
