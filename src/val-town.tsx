import { Action, ActionPanel, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { DOMParser, HTMLAnchorElement } from "linkedom";
import { useFetch } from "@raycast/utils";

const parser = new DOMParser();

export default function Command() {
  const [vals, setVals] = useState<ReadonlyArray<{ url: string; title: string }>>([]);

  const { isLoading, data } = useFetch("https://www.val.town/trending");

  useEffect(() => {
    const document = parser.parseFromString(String(data), "text/html");
    setVals(
      [...document.querySelectorAll("a[href]")].flatMap((element) => {
        if (element instanceof HTMLAnchorElement) {
          const url = "https://val.town" + element.href;
          if (!element.href.startsWith("/v/")) return [];

          const author = element.parentNode.querySelector("div.leading-4").innerHTML;
          const name = element.parentNode.querySelector("div.leading-5").innerHTML;

          return [{ url, title: `${name} (${author})` }];
        }
        return [];
      }),
    );
  }, [data]);

  return (
    <List isLoading={isLoading} selectedItemId={vals[0]?.url}>
      <List.Section title="Trending vals…">
        {vals.map(({ url, title }) => (
          <List.Item
            key={url}
            id={url}
            title={title}
            subtitle={url}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={url} />
                <Action.CopyToClipboard content={url} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
