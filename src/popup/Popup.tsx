import { useEffect, useState } from "react";

import Button from "./Button";
import Icon from "./Icon";

import styles from "./Popup.module.scss";

const Popup = () => {
  const [url, setUrl] = useState<string>("");
  const [env, setEnv] = useState<string>("");
  const [path, setPath] = useState<string>("");
  const [app, setApp] = useState<string>("");
  const [tld, setTld] = useState<string>("");
  const [target, setTarget] = useState<string | undefined>("");
  const [hoverText, setHoverText] = useState<string>("");

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];

      if (currentTab?.url) {
        setUrl(currentTab.url);
      }
    });
  }, []);

  useEffect(() => {
    if (url) {
      const _url = new URL(url);
      // host
      const host = _url.host.split(".");
      const subdomain = host[0];
      const domain = host[1];
      const tld = host.length > 3 ? host.slice(2).join(".") : host[2];

      // app
      const config = {
        org: "cedars-sinai",
        edu: "cedars-sinai-edu",
        ["co.uk"]: "cedars-sinai-uk",
      } as const;
      const app = config[tld as keyof typeof config];

      // path
      const pathname = _url.pathname.split("/");
      const idx = pathname.indexOf(app);
      const isDispatcher = !pathname.includes("content") && !pathname.includes(app);
      let path = isDispatcher
        ? pathname.slice(1).join("/").replace(".html", "")
        : pathname
            .slice(idx + 1)
            .join("/")
            .replace(".html", "");

      // set env and path
      if (domain === "cedars-sinai") {
        const _env = subdomain.split("-")[1];
        setEnv(_env === "preview" ? "prod" : _env || "prod");
        setPath(path);
        setApp(app);
        setTld(tld);
      }
    }
  }, [url]);

  useEffect(() => {
    if (hoverText && path) {
      let targetUrl;

      switch (hoverText) {
        case "preview": {
          targetUrl = `https://www-preview.cedars-sinai.${tld}/${path}.html`;
          break;
        }
        case "dispatcher": {
          const subdomain = env === "prod" ? "www" : `www-${env}`;
          targetUrl = `https://${subdomain}.cedars-sinai.${tld}/${path}.html`;
          break;
        }
        case "dashboard": {
          targetUrl = `https://author-${env}.cedars-sinai.org/sites.html/content/${app}/${path}`;
          break;
        }
        case "editor": {
          targetUrl = `https://author-${env}.cedars-sinai.org/editor.html/content/${app}/${path}.html`;
          break;
        }
        case "published": {
          targetUrl = `https://author-${env}.cedars-sinai.org/content/${app}/${path}.html?wcmmode=disabled`;
          break;
        }
      }

      setTarget(targetUrl);
    } else {
      setTarget("");
    }
  }, [hoverText, path]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>AEM WEB HELPER</h1>
        {env && <div className={styles.env}>{env}</div>}
      </div>
      <div className={styles.url}>
        <div className={styles.target}>
          <Icon name="target" />
        </div>
        <div className={styles.hover}>{target || "Target URL"}</div>
      </div>
      <div className={styles.grid}>
        {["dashboard", "editor", "published", "dispatcher", "preview"].map((name) => (
          <Button name={name} env={env} target={target} setHoverText={setHoverText} />
        ))}
      </div>
    </div>
  );
};

export default Popup;
